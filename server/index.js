import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '1234', // <-- put your real password here
  database: process.env.DATABASE_NAME || 'political_canvas'
});+3



// Simple JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
// --- Endpoints ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// User registration
// Only admin can register new users
app.post('/api/auth/register', auth, requireRole('admin'), async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role || 'volunteer']);
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Middleware for protected routes
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Role-based middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// Voter CRUD
// All roles can view voters
app.get('/api/voters', auth, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM voters');
  res.json(rows);
});

// Only admin and manager can add voters
app.post('/api/voters', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { name, address, age, gender, party, leaning, consent } = req.body;
  await db.execute(
    'INSERT INTO voters (name, address, age, gender, party, leaning, consent) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      address ?? null,
      age ?? null,
      gender ?? null,
      party ?? null,
      leaning ?? null,
      consent ?? null
    ]
  );
  res.json({ message: 'Voter added' });
});

// Only admin and manager can update voters
app.put('/api/voters/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { id } = req.params;
  const { name, address, age, gender, party, leaning, consent } = req.body;
  await db.execute(
    'UPDATE voters SET name=?, address=?, age=?, gender=?, party=?, leaning=?, consent=? WHERE id=?',
    [
      name,
      address ?? null,
      age ?? null,
      gender ?? null,
      party ?? null,
      leaning ?? null,
      consent ?? null,
      id
    ]
  );
  res.json({ message: 'Voter updated' });
});

// Only admin can delete voters
app.delete('/api/voters/:id', auth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM voters WHERE id=?', [id]);
  res.json({ message: 'Voter deleted' });
});

// Canvassing logs
// All roles can view logs
app.get('/api/logs', auth, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM logs');
  res.json(rows);
});

// All roles can add logs, but volunteers can only add for themselves
app.post('/api/logs', auth, async (req, res) => {
  const { voter_id, user_id, sentiment, issues, notes } = req.body;
  if (req.user.role === 'volunteer' && req.user.id !== user_id) {
    return res.status(403).json({ error: 'Volunteers can only add logs for themselves' });
  }
  await db.execute('INSERT INTO logs (voter_id, user_id, sentiment, issues, notes) VALUES (?, ?, ?, ?, ?)', [voter_id, user_id, sentiment, issues, notes]);
  res.json({ message: 'Log added' });
});

// Walk lists
// All roles can view walklists
app.get('/api/walklists', auth, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM walklists');
  res.json(rows);
});

// Only admin and manager can create walklists
app.post('/api/walklists', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { name, filter } = req.body;
  await db.execute('INSERT INTO walklists (name, filter) VALUES (?, ?)', [name, JSON.stringify(filter)]);
  res.json({ message: 'Walklist created' });
});

// Territories
// All roles can view territories
app.get('/api/territories', auth, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM territories');
  res.json(rows);
});

// Only admin and manager can assign territories
app.post('/api/territories', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { name, assigned_to } = req.body;
  await db.execute('INSERT INTO territories (name, assigned_to) VALUES (?, ?)', [name, assigned_to]);
  res.json({ message: 'Territory assigned' });
});

// Offline sync
// All roles can sync logs, but volunteers can only sync their own logs
app.post('/api/sync', auth, async (req, res) => {
  // Accepts array of logs to sync
  const { logs } = req.body;
  for (const log of logs) {
    if (req.user.role === 'volunteer' && req.user.id !== log.user_id) {
      return res.status(403).json({ error: 'Volunteers can only sync their own logs' });
    }
    await db.execute('INSERT INTO logs (voter_id, user_id, sentiment, issues, notes) VALUES (?, ?, ?, ?, ?)', [log.voter_id, log.user_id, log.sentiment, log.issues, log.notes]);
  }
  res.json({ message: 'Synced' });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
