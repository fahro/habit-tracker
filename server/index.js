import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {
  initDatabase,
  getAllUsers, getUserById, getUserByName, createUser, updateUserDisplayName, deleteUser,
  getHabitsByUser, getHabitById, createHabit, updateHabit, deleteHabit,
  addActivityLog, getActivityLogById, getActivityLogsByHabitAndDate,
  getActivityLogsByUserAndDate, updateActivityLog, deleteActivityLog,
  getUserTodayStats, getHabitDetailedStats, getHabitDailyStats, getUserMonthlyCalendarData
} from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

initDatabase();

// ---- Users ----

app.get('/api/users', (_req, res) => {
  res.json(getAllUsers());
});

app.get('/api/users/:id', (req, res) => {
  const user = getUserById(parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const { name, displayName } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (getUserByName(name)) return res.status(400).json({ error: 'A user with that name already exists' });
  const id = createUser(name, displayName);
  res.json(getUserById(id));
});

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = getUserById(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { displayName } = req.body;
  if (displayName !== undefined) updateUserDisplayName(id, displayName);
  res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const users = getAllUsers();
  if (users.length === 1) return res.status(400).json({ error: 'Cannot delete the only user' });
  if (!getUserById(id)) return res.status(404).json({ error: 'User not found' });
  deleteUser(id);
  res.json({ success: true });
});

// ---- Habits ----

app.get('/api/habits', (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const includeInactive = req.query.includeInactive === 'true';
  res.json(getHabitsByUser(userId, includeInactive));
});

app.get('/api/habits/:id', (req, res) => {
  const habit = getHabitById(parseInt(req.params.id));
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  res.json(habit);
});

app.post('/api/habits', (req, res) => {
  const { userId, name, color, dailyMinMinutes, penaltyDays } = req.body;
  if (!userId || !name) return res.status(400).json({ error: 'userId and name are required' });
  const id = createHabit(userId, name, color, dailyMinMinutes, penaltyDays);
  res.json(getHabitById(id));
});

app.put('/api/habits/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const habit = getHabitById(id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  const { name, color, dailyMinMinutes, isActive, penaltyDays } = req.body;
  updateHabit(
    id,
    name !== undefined ? name : habit.name,
    color !== undefined ? color : habit.color,
    dailyMinMinutes !== undefined ? dailyMinMinutes : habit.daily_min_minutes,
    isActive !== undefined ? isActive : habit.is_active === 1,
    penaltyDays !== undefined ? penaltyDays : (habit.penalty_days || 2)
  );
  res.json(getHabitById(id));
});

app.delete('/api/habits/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!getHabitById(id)) return res.status(404).json({ error: 'Habit not found' });
  deleteHabit(id);
  res.json({ success: true });
});

// ---- Activity Logs ----

app.get('/api/logs', (req, res) => {
  const { habitId, userId, date } = req.query;
  if (habitId && date) {
    return res.json(getActivityLogsByHabitAndDate(parseInt(habitId), date));
  }
  if (userId && date) {
    return res.json(getActivityLogsByUserAndDate(parseInt(userId), date));
  }
  res.status(400).json({ error: 'Provide habitId+date or userId+date' });
});

app.post('/api/logs', (req, res) => {
  const { habitId, userId, date, durationMinutes, notes } = req.body;
  if (!habitId || !userId || !date || !durationMinutes) {
    return res.status(400).json({ error: 'habitId, userId, date, durationMinutes are required' });
  }
  if (durationMinutes <= 0) {
    return res.status(400).json({ error: 'durationMinutes must be greater than 0' });
  }
  const id = addActivityLog(parseInt(habitId), parseInt(userId), date, parseInt(durationMinutes), notes || null);
  res.json(getActivityLogById(id));
});

app.put('/api/logs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const log = getActivityLogById(id);
  if (!log) return res.status(404).json({ error: 'Log not found' });
  const { durationMinutes, notes } = req.body;
  if (durationMinutes !== undefined && durationMinutes <= 0) {
    return res.status(400).json({ error: 'durationMinutes must be greater than 0' });
  }
  updateActivityLog(
    id,
    durationMinutes !== undefined ? parseInt(durationMinutes) : log.duration_minutes,
    notes !== undefined ? notes : log.notes
  );
  res.json(getActivityLogById(id));
});

app.delete('/api/logs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!getActivityLogById(id)) return res.status(404).json({ error: 'Log not found' });
  deleteActivityLog(id);
  res.json({ success: true });
});

// ---- Stats ----

app.get('/api/stats/today', (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  res.json(getUserTodayStats(userId));
});

app.get('/api/stats/habit/:habitId', (req, res) => {
  const habitId = parseInt(req.params.habitId);
  const numDays = parseInt(req.query.days) || 30;
  const dailyStats = getHabitDailyStats(habitId, numDays);
  const detailedStats = getHabitDetailedStats(habitId);
  res.json({ ...detailedStats, dailyStats });
});

app.get('/api/stats/calendar', (req, res) => {
  const { userId, year, month } = req.query;
  if (!userId || year === undefined || month === undefined) {
    return res.status(400).json({ error: 'userId, year, and month are required' });
  }
  const data = getUserMonthlyCalendarData(parseInt(userId), parseInt(year), parseInt(month));
  res.json(data);
});

// ---- Health ----

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /\n');
});

if (process.env.NODE_ENV === 'production') {
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
