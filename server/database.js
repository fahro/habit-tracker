import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../data')
  : __dirname;

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
  }
  fs.accessSync(dataDir, fs.constants.W_OK);
  console.log(`Data directory: ${dataDir}`);
} catch (error) {
  console.error('Data directory error:', error);
  const tmpDir = '/tmp/data';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true, mode: 0o755 });
  }
}

const dbPath = path.join(dataDir, 'habits.db');
let db;
try {
  db = new Database(dbPath);
} catch (error) {
  db = new Database('/tmp/data/habits.db');
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6366f1',
      daily_min_minutes INTEGER DEFAULT 30,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_logs_habit_date ON activity_logs(habit_id, date);
    CREATE INDEX IF NOT EXISTS idx_logs_user_date ON activity_logs(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
  `);

  console.log('Database initialized');
}

// ---- Users ----

export function getAllUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at ASC').all();
}

export function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function getUserByName(name) {
  return db.prepare('SELECT * FROM users WHERE name = ?').get(name);
}

export function createUser(name, displayName = null) {
  try {
    const result = db.prepare(
      'INSERT INTO users (name, display_name) VALUES (?, ?)'
    ).run(name, displayName || name);
    return result.lastInsertRowid;
  } catch {
    const existing = getUserByName(name);
    return existing ? existing.id : null;
  }
}

export function updateUserDisplayName(id, displayName) {
  db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(displayName, id);
}

export function deleteUser(id) {
  const habits = db.prepare('SELECT id FROM habits WHERE user_id = ?').all(id);
  for (const h of habits) {
    db.prepare('DELETE FROM activity_logs WHERE habit_id = ?').run(h.id);
  }
  db.prepare('DELETE FROM habits WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

// ---- Habits ----

export function getHabitsByUser(userId, includeInactive = false) {
  const query = includeInactive
    ? 'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC'
    : 'SELECT * FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY created_at ASC';
  return db.prepare(query).all(userId);
}

export function getHabitById(id) {
  return db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
}

export function createHabit(userId, name, color, dailyMinMinutes) {
  const result = db.prepare(
    'INSERT INTO habits (user_id, name, color, daily_min_minutes) VALUES (?, ?, ?, ?)'
  ).run(userId, name, color || '#6366f1', dailyMinMinutes || 30);
  return result.lastInsertRowid;
}

export function updateHabit(id, name, color, dailyMinMinutes, isActive) {
  db.prepare(
    'UPDATE habits SET name = ?, color = ?, daily_min_minutes = ?, is_active = ? WHERE id = ?'
  ).run(name, color, dailyMinMinutes, isActive ? 1 : 0, id);
}

export function deleteHabit(id) {
  db.prepare('DELETE FROM activity_logs WHERE habit_id = ?').run(id);
  db.prepare('DELETE FROM habits WHERE id = ?').run(id);
}

// ---- Activity Logs ----

export function addActivityLog(habitId, userId, date, durationMinutes, notes = null) {
  const result = db.prepare(
    'INSERT INTO activity_logs (habit_id, user_id, date, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(habitId, userId, date, durationMinutes, notes);
  return result.lastInsertRowid;
}

export function getActivityLogById(id) {
  return db.prepare('SELECT * FROM activity_logs WHERE id = ?').get(id);
}

export function getActivityLogsByHabitAndDate(habitId, date) {
  return db.prepare(
    'SELECT * FROM activity_logs WHERE habit_id = ? AND date = ? ORDER BY created_at ASC'
  ).all(habitId, date);
}

export function getActivityLogsByUserAndDate(userId, date) {
  return db.prepare(
    'SELECT al.*, h.name as habit_name, h.color as habit_color FROM activity_logs al JOIN habits h ON al.habit_id = h.id WHERE al.user_id = ? AND al.date = ? ORDER BY h.name, al.created_at ASC'
  ).all(userId, date);
}

export function updateActivityLog(id, durationMinutes, notes) {
  db.prepare(
    'UPDATE activity_logs SET duration_minutes = ?, notes = ? WHERE id = ?'
  ).run(durationMinutes, notes, id);
}

export function deleteActivityLog(id) {
  db.prepare('DELETE FROM activity_logs WHERE id = ?').run(id);
}

// ---- Stats ----

export function getUserTodayStats(userId) {
  const today = new Date().toISOString().split('T')[0];
  const habits = getHabitsByUser(userId);

  return habits.map(habit => {
    const row = db.prepare(`
      SELECT SUM(duration_minutes) as total_minutes, COUNT(*) as log_count
      FROM activity_logs WHERE habit_id = ? AND date = ?
    `).get(habit.id, today);

    const totalMinutes = row.total_minutes || 0;
    const metGoal = totalMinutes >= habit.daily_min_minutes;
    const progress = habit.daily_min_minutes > 0
      ? Math.min(100, Math.round((totalMinutes / habit.daily_min_minutes) * 100))
      : 100;

    const streakStats = computeHabitStreak(habit.id, habit.daily_min_minutes);

    return {
      habit,
      today: { totalMinutes, logCount: row.log_count || 0, metGoal, progress },
      streak: streakStats.current
    };
  });
}

function computeHabitStreak(habitId, minGoal) {
  const dailyTotals = db.prepare(`
    SELECT date, SUM(duration_minutes) as total_minutes
    FROM activity_logs WHERE habit_id = ?
    GROUP BY date ORDER BY date DESC
  `).all(habitId);

  const today = new Date().toISOString().split('T')[0];
  const checkDate = new Date();
  let current = 0;

  for (let i = 0; i <= dailyTotals.length + 1; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayData = dailyTotals.find(d => d.date === dateStr);

    if (dayData && dayData.total_minutes >= minGoal) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (!dayData && dateStr === today) {
      // Today not logged yet — don't break streak
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak
  const sorted = [...dailyTotals].sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0;
  let temp = 0;
  for (const day of sorted) {
    if (day.total_minutes >= minGoal) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 0;
    }
  }

  return { current, longest };
}

export function getHabitDetailedStats(habitId) {
  const habit = getHabitById(habitId);
  if (!habit) return null;

  const totals = db.prepare(`
    SELECT COUNT(DISTINCT date) as days_active,
           SUM(duration_minutes) as total_minutes,
           COUNT(*) as total_logs
    FROM activity_logs WHERE habit_id = ?
  `).get(habitId);

  const streaks = computeHabitStreak(habitId, habit.daily_min_minutes);

  // Total penalties (all time)
  const allDailyTotals = db.prepare(`
    SELECT date, SUM(duration_minutes) as total_minutes
    FROM activity_logs WHERE habit_id = ?
    GROUP BY date ORDER BY date ASC
  `).all(habitId);

  // Build penalty count from the full history
  const startDate = habit.created_at
    ? new Date(habit.created_at).toISOString().split('T')[0]
    : allDailyTotals[0]?.date;

  let penalties = 0;
  if (startDate) {
    const end = new Date();
    const start = new Date(startDate);
    const dateMap = new Map(allDailyTotals.map(d => [d.date, d.total_minutes]));
    let consec = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const ds = d.toISOString().split('T')[0];
      const mins = dateMap.get(ds) || 0;
      if (mins < habit.daily_min_minutes) {
        consec++;
        if (consec >= 2) penalties++;
      } else {
        consec = 0;
      }
    }
  }

  return {
    daysActive: totals.days_active || 0,
    totalMinutes: totals.total_minutes || 0,
    totalLogs: totals.total_logs || 0,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalPenalties: penalties
  };
}

export function getHabitDailyStats(habitId, numDays = 30) {
  const habit = getHabitById(habitId);
  if (!habit) return { stats: [], totalPenalties: 0 };

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - numDays + 1);
  start.setHours(0, 0, 0, 0);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const dailyTotals = db.prepare(`
    SELECT date, SUM(duration_minutes) as total_minutes, COUNT(*) as log_count
    FROM activity_logs
    WHERE habit_id = ? AND date >= ? AND date <= ?
    GROUP BY date ORDER BY date DESC
  `).all(habitId, startStr, endStr);

  const dateMap = new Map(dailyTotals.map(d => [d.date, d]));
  const stats = [];

  for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const data = dateMap.get(dateStr);
    const totalMinutes = data ? data.total_minutes : 0;
    const metGoal = totalMinutes >= habit.daily_min_minutes;

    stats.push({
      date: dateStr,
      totalMinutes,
      logCount: data ? data.log_count : 0,
      metGoal,
      dailyMin: habit.daily_min_minutes,
      status: totalMinutes === 0 ? 'none' : (metGoal ? 'success' : 'partial')
    });
  }

  // Mark penalty days (2+ consecutive misses)
  let consecutiveMisses = 0;
  let penalties = 0;

  for (let i = stats.length - 1; i >= 0; i--) {
    const day = stats[i];
    if (!day.metGoal) {
      consecutiveMisses++;
      if (consecutiveMisses >= 2) {
        penalties++;
        day.penalty = true;
      }
    } else {
      consecutiveMisses = 0;
    }
    day.consecutiveMisses = consecutiveMisses;
  }

  return { stats: stats.reverse(), totalPenalties: penalties };
}

export function getUserMonthlyCalendarData(userId, year, month) {
  const habits = getHabitsByUser(userId);
  if (habits.length === 0) return [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startStr = firstDay.toISOString().split('T')[0];
  const endStr = lastDay.toISOString().split('T')[0];

  // Get all logs for the month for this user
  const logs = db.prepare(`
    SELECT al.date, al.habit_id, SUM(al.duration_minutes) as total_minutes
    FROM activity_logs al
    WHERE al.user_id = ? AND al.date >= ? AND al.date <= ?
    GROUP BY al.date, al.habit_id
  `).all(userId, startStr, endStr);

  const days = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.date === dateStr);

    let habitsMetCount = 0;
    let habitsTotal = habits.length;

    for (const habit of habits) {
      const log = dayLogs.find(l => l.habit_id === habit.id);
      if (log && log.total_minutes >= habit.daily_min_minutes) {
        habitsMetCount++;
      }
    }

    const totalMinutes = dayLogs.reduce((sum, l) => sum + l.total_minutes, 0);

    days.push({
      date: dateStr,
      totalMinutes,
      habitsMetCount,
      habitsTotal,
      allMet: habitsMetCount === habitsTotal && habitsTotal > 0,
      anyMet: habitsMetCount > 0,
      hasActivity: totalMinutes > 0
    });
  }

  return days;
}

export default db;
