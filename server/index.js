import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDatabase, addSession, getSessions, getDailyStats, getOverallStats, getUser, updateUser, getAllUsers, getUserById, createUser, getUserByName, updateUserSettings, deleteUser, getMonthlyGoal, setMonthlyGoal, getAllMonthlySettings } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());

// Initialize database
initDatabase();

// Parse time duration like "18m 32s" or "1h 5m" to seconds
function parseTimeToSeconds(timeStr) {
  const hours = timeStr.match(/(\d+)h/);
  const minutes = timeStr.match(/(\d+)m/);
  const seconds = timeStr.match(/(\d+)s/);
  
  let totalSeconds = 0;
  if (hours) totalSeconds += parseInt(hours[1]) * 3600;
  if (minutes) totalSeconds += parseInt(minutes[1]) * 60;
  if (seconds) totalSeconds += parseInt(seconds[1]);
  
  return totalSeconds;
}

// Extract username from message (Viber/WhatsApp format)
function extractUsername(message) {
  const lines = message.trim().split('\n');
  if (lines.length === 0) return null;
  
  const firstLine = lines[0].trim();
  
  // Check for "Name:" format
  const colonMatch = firstLine.match(/^([^:]+):\s*$/);
  if (colonMatch) {
    return colonMatch[1].trim();
  }
  
  // Check for "@Name" format
  const atMatch = firstLine.match(/^@([\w\s]+)/);
  if (atMatch) {
    return atMatch[1].trim();
  }
  
  return null;
}

// Parse message format with optional username
function parseMessage(message) {
  const lines = message.trim().split('\n');
  const sessions = [];
  let username = null;
  let startIndex = 0;
  
  // Check if first line is a username
  if (lines.length > 0) {
    username = extractUsername(lines.join('\n'));
    if (username) {
      startIndex = 1; // Skip first line
    }
  }
  
  // Check if it's inline format (single line or no clear line separation)
  if (lines.length <= 2) {
    const contentLine = lines.slice(startIndex).join(' ').trim();
    
    // Try to parse inline format: "Lesson 1 30m Lesson 2 45m"
    // Regex to match duration patterns: 1h 30m 45s, 30m, 1h, etc.
    const durationPattern = /(\d+h\s*\d+m\s*\d+s|\d+h\s*\d+m|\d+m\s*\d+s|\d+h|\d+m|\d+s)/gi;
    
    const matches = [];
    let match;
    while ((match = durationPattern.exec(contentLine)) !== null) {
      matches.push({
        duration: match[0],
        index: match.index
      });
    }
    
    if (matches.length > 0) {
      // Parse sessions based on duration positions
      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];
        
        // Lesson name is before the duration
        const lessonStart = i === 0 ? 0 : matches[i - 1].index + matches[i - 1].duration.length;
        const lessonEnd = currentMatch.index;
        const lessonName = contentLine.substring(lessonStart, lessonEnd).trim();
        
        const durationSeconds = parseTimeToSeconds(currentMatch.duration);
        
        if (lessonName && durationSeconds > 0) {
          sessions.push({
            lessonName,
            duration: durationSeconds
          });
        }
      }
      
      return { username, sessions };
    }
  }
  
  // Original format: line-by-line (lesson + duration pairs)
  for (let i = startIndex; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      const lessonName = lines[i].trim();
      const duration = lines[i + 1].trim();
      const durationSeconds = parseTimeToSeconds(duration);
      
      if (lessonName && durationSeconds > 0) {
        sessions.push({
          lessonName,
          duration: durationSeconds
        });
      }
    }
  }
  
  return { username, sessions };
}

// API Routes

// Get all users
app.get('/api/users', (req, res) => {
  const users = getAllUsers();
  res.json(users);
});

// Get specific user
app.get('/api/users/:userId', (req, res) => {
  const user = getUserById(parseInt(req.params.userId));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Create new user
app.post('/api/users', (req, res) => {
  const { name, displayName, dailyGoalMinutes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // Check if user already exists
  const existingUser = getUserByName(name);
  if (existingUser) {
    return res.status(400).json({ error: 'Korisnik sa ovim imenom već postoji' });
  }
  
  const userId = createUser(name, displayName, dailyGoalMinutes);
  const user = getUserById(userId);
  res.json(user);
});

// Update user settings
app.put('/api/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { dailyGoalMinutes } = req.body;
  
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  updateUserSettings(userId, dailyGoalMinutes);
  res.json({ success: true });
});

// Delete user
app.delete('/api/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Korisnik nije pronađen' });
  }
  
  // Check if there are other users
  const allUsers = getAllUsers();
  if (allUsers.length === 1) {
    return res.status(400).json({ error: 'Ne možete obrisati jedinog korisnika' });
  }
  
  deleteUser(userId);
  res.json({ success: true, message: 'Korisnik uspješno obrisan' });
});

// Legacy endpoints for backward compatibility
app.get('/api/user', (req, res) => {
  const users = getAllUsers();
  if (users.length === 0) {
    return res.json({ id: null, name: 'No users', daily_goal_minutes: 30 });
  }
  res.json(users[0]); // Return first user
});

app.put('/api/user', (req, res) => {
  const { dailyGoalMinutes, userId } = req.body;
  const targetUserId = userId || 1;
  updateUserSettings(targetUserId, dailyGoalMinutes);
  res.json({ success: true });
});

// Add session(s) - can accept JSON or text message
app.post('/api/sessions', (req, res) => {
  try {
    let sessions = [];
    let userId = req.body.userId || undefined;
    let username = req.body.username || undefined;
    const date = new Date().toISOString().split('T')[0];
    
    // Check if it's a text message (from Viber/WhatsApp)
    if (typeof req.body === 'string') {
      const parsed = parseMessage(req.body);
      sessions = parsed.sessions;
      username = parsed.username || username;
    } else if (Array.isArray(req.body)) {
      sessions = req.body;
    } else if (req.body.lessonName && req.body.duration) {
      sessions = [req.body];
    } else if (req.body.message) {
      const parsed = parseMessage(req.body.message);
      sessions = parsed.sessions;
      username = parsed.username || username;
    }
    
    // Get or create user based on username
    if (username && !userId) {
      let user = getUserByName(username);
      if (!user) {
        userId = createUser(username);
      } else {
        userId = user.id;
      }
    }
    
    // If still no userId, use first user or create default
    if (!userId) {
      const users = getAllUsers();
      if (users.length > 0) {
        userId = users[0].id;
      } else {
        userId = createUser('Default User');
      }
    }
    
    const addedSessions = [];
    for (const session of sessions) {
      const id = addSession(userId, session.lessonName, session.duration, date);
      addedSessions.push({ id, ...session });
    }
    
    const user = getUserById(userId);
    
    res.json({ 
      success: true, 
      sessions: addedSessions,
      count: addedSessions.length,
      user: user ? user.name : 'Unknown'
    });
  } catch (error) {
    console.error('Error adding sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sessions for a user
app.get('/api/sessions', (req, res) => {
  const { startDate, endDate, userId } = req.query;
  const targetUserId = userId ? parseInt(userId) : (getAllUsers()[0]?.id || null);
  
  if (!targetUserId) {
    return res.json([]);
  }
  
  const sessions = getSessions(targetUserId, startDate, endDate);
  res.json(sessions);
});

// Get daily statistics for a user
app.get('/api/stats/daily', (req, res) => {
  const { days, userId } = req.query;
  const numDays = days ? parseInt(days) : 30;
  const targetUserId = userId ? parseInt(userId) : (getAllUsers()[0]?.id || null);
  
  if (!targetUserId) {
    return res.json({ stats: [], totalPenalties: 0 });
  }
  
  const stats = getDailyStats(targetUserId, numDays);
  res.json(stats);
});

// Get overall statistics for a user
app.get('/api/stats/overall', (req, res) => {
  const { userId } = req.query;
  const targetUserId = userId ? parseInt(userId) : (getAllUsers()[0]?.id || null);
  
  if (!targetUserId) {
    return res.json({ totalSessions: 0, totalSeconds: 0, totalHours: 0, totalMinutes: 0, daysActive: 0, currentStreak: 0, longestStreak: 0, dailyGoalMinutes: 30 });
  }
  
  const stats = getOverallStats(targetUserId);
  res.json(stats);
});

// Webhook endpoint for Viber/WhatsApp
app.post('/api/webhook/message', (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    let username;
    let sessions;
    
    // Check if author is provided
    if (req.body.author) {
      username = req.body.author.trim();
      
      if (!username) {
        return res.status(400).json({ 
          error: 'Author ne može biti prazan' 
        });
      }
      
      // Content can be in 'content' or 'message' parameter
      const content = req.body.content || req.body.message;
      
      if (!content) {
        return res.status(400).json({ 
          error: 'Content ili message parametar je obavezan' 
        });
      }
      
      // Parse content (without username prefix since we have author)
      const parsed = parseMessage(content);
      sessions = parsed.sessions;
    }
    // No author provided - try to parse username from message
    else {
      const message = req.body.message || req.body.text || req.body;
      const messageText = typeof message === 'string' ? message : JSON.stringify(message);
      
      const parsed = parseMessage(messageText);
      username = parsed.username;
      sessions = parsed.sessions;
    }
    
    // Get or create user
    let userId;
    if (username) {
      let user = getUserByName(username);
      if (!user) {
        userId = createUser(username);
      } else {
        userId = user.id;
      }
    } else {
      // Use first user or create default
      const users = getAllUsers();
      if (users.length > 0) {
        userId = users[0].id;
      } else {
        userId = createUser('Default User');
      }
    }
    
    const addedSessions = [];
    for (const session of sessions) {
      const id = addSession(userId, session.lessonName, session.duration, date);
      addedSessions.push({ id, ...session });
    }
    
    const user = getUserById(userId);
    
    res.json({ 
      success: true, 
      message: `✅ ${user.display_name || user.name}: Zabilježeno ${addedSessions.length} lekcija!`,
      sessions: addedSessions,
      user: user.name,
      count: addedSessions.length
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Monthly settings endpoints
app.get('/api/settings/monthly/:year/:month', (req, res) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  
  const dailyGoalMinutes = getMonthlyGoal(year, month);
  res.json({ year, month, dailyGoalMinutes });
});

app.post('/api/settings/monthly', (req, res) => {
  const { year, month, dailyGoalMinutes } = req.body;
  
  if (!year || month === undefined || !dailyGoalMinutes) {
    return res.status(400).json({ error: 'Year, month, and dailyGoalMinutes are required' });
  }
  
  const goal = setMonthlyGoal(year, month, dailyGoalMinutes);
  res.json({ year, month, dailyGoalMinutes: goal, message: 'Mjesečni cilj uspješno postavljen' });
});

app.get('/api/settings/monthly', (req, res) => {
  const settings = getAllMonthlySettings();
  res.json(settings);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
