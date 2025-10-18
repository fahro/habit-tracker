import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use data directory for persistence (Docker volume)
const dataDir = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../data')
  : __dirname;

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'study-tracker.db');
console.log(`📁 Database location: ${dbPath}`);

const db = new Database(dbPath);

export function initDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT,
      daily_goal_minutes INTEGER DEFAULT 30,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_name TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create global monthly settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(year, month)
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
  `);

  // No default user needed - users are created on-demand

  console.log('✅ Database initialized');
}

// Multi-user functions
export function getAllUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at ASC').all();
}

export function getUserById(userId) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

export function getUserByName(name) {
  return db.prepare('SELECT * FROM users WHERE name = ?').get(name);
}

export function createUser(name, displayName = null, dailyGoalMinutes = 30) {
  try {
    const result = db.prepare(`
      INSERT INTO users (name, display_name, daily_goal_minutes)
      VALUES (?, ?, ?)
    `).run(name, displayName || name, dailyGoalMinutes);
    return result.lastInsertRowid;
  } catch (error) {
    // User already exists, return existing user
    const existing = getUserByName(name);
    return existing ? existing.id : null;
  }
}

export function updateUserSettings(userId, dailyGoalMinutes) {
  db.prepare('UPDATE users SET daily_goal_minutes = ? WHERE id = ?').run(dailyGoalMinutes, userId);
}

export function deleteUser(userId) {
  // Delete all sessions for this user first
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  // Then delete the user
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

// Legacy function for backward compatibility
export function getUser(userId = 1) {
  return getUserById(userId);
}

export function updateUser(dailyGoalMinutes, userId = 1) {
  updateUserSettings(userId, dailyGoalMinutes);
}

export function addSession(userId, lessonName, durationSeconds, date) {
  const result = db.prepare(`
    INSERT INTO sessions (user_id, lesson_name, duration_seconds, date)
    VALUES (?, ?, ?, ?)
  `).run(userId, lessonName, durationSeconds, date);
  return result.lastInsertRowid;
}

export function getSessions(userId, startDate, endDate) {
  let query = 'SELECT * FROM sessions WHERE user_id = ?';
  const params = [userId];
  
  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }
  
  query += ' ORDER BY date DESC, created_at DESC';
  
  return db.prepare(query).all(...params);
}

export function getDailyStats(userId, numDays = 30) {
  const user = getUserById(userId);
  if (!user) return { stats: [], totalPenalties: 0 };
  
  // Get date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numDays);
  
  // Don't go before user creation date
  let userCreatedDate = user.created_at ? new Date(user.created_at) : startDate;
  // Set to start of day (midnight) to include the full creation day
  userCreatedDate.setHours(0, 0, 0, 0);
  
  const effectiveStartDate = startDate > userCreatedDate ? startDate : userCreatedDate;
  
  const startDateStr = effectiveStartDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // Get daily totals
  const dailyTotals = db.prepare(`
    SELECT 
      date,
      COUNT(*) as session_count,
      SUM(duration_seconds) as total_seconds
    FROM sessions
    WHERE user_id = ? AND date >= ? AND date <= ?
    GROUP BY date
    ORDER BY date DESC
  `).all(userId, startDateStr, endDateStr);
  
  // Create a map of all dates in range
  const stats = [];
  const dateMap = new Map(dailyTotals.map(d => [d.date, d]));
  
  for (let d = new Date(endDate); d >= effectiveStartDate; d.setDate(d.getDate() - 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const data = dateMap.get(dateStr);
    
    // Get monthly goal for this specific date
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    const dailyGoalMinutes = getMonthlyGoal(year, month);
    const dailyGoalSeconds = dailyGoalMinutes * 60;
    
    const totalSeconds = data ? data.total_seconds : 0;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const metGoal = totalSeconds >= dailyGoalSeconds;
    
    stats.push({
      date: dateStr,
      sessionCount: data ? data.session_count : 0,
      totalSeconds,
      totalMinutes,
      metGoal,
      status: totalSeconds === 0 ? 'none' : (metGoal ? 'success' : 'partial')
    });
  }
  
  // Calculate consecutive misses and penalties
  let consecutiveMisses = 0;
  let penalties = 0;
  
  // Reverse to go chronologically
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
  
  return {
    stats: stats.reverse(), // Return in reverse chronological order
    totalPenalties: penalties
  };
}

export function getOverallStats(userId) {
  const user = getUserById(userId);
  if (!user) return { totalSessions: 0, totalSeconds: 0, totalHours: 0, totalMinutes: 0, daysActive: 0, currentStreak: 0, longestStreak: 0, dailyGoalMinutes: 30 };
  
  // Get current month's goal for display
  const now = new Date();
  const currentMonthGoal = getMonthlyGoal(now.getFullYear(), now.getMonth());
  
  // Total sessions and time
  const totals = db.prepare(`
    SELECT 
      COUNT(*) as total_sessions,
      SUM(duration_seconds) as total_seconds,
      COUNT(DISTINCT date) as days_active
    FROM sessions
    WHERE user_id = ?
  `).get(userId);
  
  // Get daily stats for streak calculation
  const allDailyStats = db.prepare(`
    SELECT 
      date,
      SUM(duration_seconds) as total_seconds
    FROM sessions
    WHERE user_id = ?
    GROUP BY date
    ORDER BY date DESC
  `).all(userId);
  
  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date();
  
  for (const day of allDailyStats) {
    const dayDate = checkDate.toISOString().split('T')[0];
    
    // Get goal for this day
    const dayGoalMinutes = getMonthlyGoal(checkDate.getFullYear(), checkDate.getMonth());
    const dayGoalSeconds = dayGoalMinutes * 60;
    
    if (day.date === dayDate && day.total_seconds >= dayGoalSeconds) {
      if (currentStreak === tempStreak) {
        currentStreak++;
      }
      tempStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (day.date === dayDate) {
      tempStreak = 0;
      break;
    }
  }
  
  // Calculate longest streak
  let streak = 0;
  const dateMap = new Map(allDailyStats.map(d => [d.date, d]));
  
  // Go through all dates
  const sortedDates = allDailyStats.map(d => d.date).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const data = dateMap.get(date);
    
    // Get goal for this specific date
    const dateObj = new Date(date);
    const dateGoalMinutes = getMonthlyGoal(dateObj.getFullYear(), dateObj.getMonth());
    const dateGoalSeconds = dateGoalMinutes * 60;
    
    if (data && data.total_seconds >= dateGoalSeconds) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }
  
  const totalHours = Math.floor((totals.total_seconds || 0) / 3600);
  const totalMinutes = Math.floor(((totals.total_seconds || 0) % 3600) / 60);
  
  return {
    totalSessions: totals.total_sessions || 0,
    totalSeconds: totals.total_seconds || 0,
    totalHours,
    totalMinutes,
    daysActive: totals.days_active || 0,
    currentStreak,
    longestStreak,
    dailyGoalMinutes: currentMonthGoal // Return current month's goal
  };
}

// Monthly Settings functions
export function getMonthlyGoal(year, month) {
  const setting = db.prepare('SELECT daily_goal_minutes FROM monthly_settings WHERE year = ? AND month = ?').get(year, month);
  return setting ? setting.daily_goal_minutes : 30; // Default 30 minutes
}

export function setMonthlyGoal(year, month, dailyGoalMinutes) {
  db.prepare(`
    INSERT INTO monthly_settings (year, month, daily_goal_minutes)
    VALUES (?, ?, ?)
    ON CONFLICT(year, month) 
    DO UPDATE SET daily_goal_minutes = excluded.daily_goal_minutes
  `).run(year, month, dailyGoalMinutes);
  
  return getMonthlyGoal(year, month);
}

export function getAllMonthlySettings() {
  return db.prepare('SELECT * FROM monthly_settings ORDER BY year DESC, month DESC').all();
}

export default db;
