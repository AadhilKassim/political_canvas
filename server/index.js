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
// Open registration (sets role to 'volunteer' by default)
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    // Force role to 'volunteer' for open registration (only admins can create other roles)
    await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'volunteer']);
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

// Territories
// All roles can view territories
app.get('/api/territories', auth, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT t.*, u.username as assigned_username 
    FROM territories t 
    LEFT JOIN users u ON t.assigned_to = u.id
  `);
  res.json(rows);
});

// Get my territories (for volunteers)
app.get('/api/territories/my', auth, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT t.*, 
      (SELECT COUNT(*) FROM voters WHERE territory_id = t.id) as total_voters,
      (SELECT COUNT(*) FROM voters WHERE territory_id = t.id AND contact_status != 'not_contacted') as contacted_voters
    FROM territories t 
    WHERE t.assigned_to = ?
  `, [req.user.id]);
  res.json(rows);
});

// Get territory details with voters
app.get('/api/territories/:id', auth, async (req, res) => {
  const { id } = req.params;
  
  // Check if user has access (admin, manager, or assigned volunteer)
  const [territory] = await db.execute('SELECT * FROM territories WHERE id = ?', [id]);
  if (!territory.length) return res.status(404).json({ error: 'Territory not found' });
  
  if (req.user.role === 'volunteer' && territory[0].assigned_to !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const [voters] = await db.execute(`
    SELECT v.*, l.notes as last_note, l.created_at as last_contact_date
    FROM voters v
    LEFT JOIN (
      SELECT voter_id, notes, created_at,
        ROW_NUMBER() OVER (PARTITION BY voter_id ORDER BY created_at DESC) as rn
      FROM logs
    ) l ON v.id = l.voter_id AND l.rn = 1
    WHERE v.territory_id = ?
    ORDER BY v.contact_status, v.address
  `, [id]);
  
  res.json({ territory: territory[0], voters });
});

// Only admin and manager can create territories
app.post('/api/territories', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { name, description, area_type, assigned_to } = req.body;
  const [result] = await db.execute(
    'INSERT INTO territories (name, description, area_type, assigned_to) VALUES (?, ?, ?, ?)', 
    [name, description || null, area_type || 'custom', assigned_to || null]
  );
  res.json({ message: 'Territory created', id: result.insertId });
});

// Update territory
app.put('/api/territories/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { id } = req.params;
  const { name, description, area_type, assigned_to } = req.body;
  await db.execute(
    'UPDATE territories SET name=?, description=?, area_type=?, assigned_to=? WHERE id=?',
    [name, description || null, area_type || 'custom', assigned_to || null, id]
  );
  res.json({ message: 'Territory updated' });
});

// Delete territory
app.delete('/api/territories/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { id } = req.params;
  await db.execute('DELETE FROM territories WHERE id=?', [id]);
  res.json({ message: 'Territory deleted' });
});

// Assign voters to territory
app.post('/api/territories/:id/assign-voters', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { id } = req.params;
  const { voter_ids } = req.body;
  
  for (const voter_id of voter_ids) {
    await db.execute('UPDATE voters SET territory_id = ? WHERE id = ?', [id, voter_id]);
  }
  
  res.json({ message: 'Voters assigned to territory' });
});

// Walk lists
// All roles can view walklists
app.get('/api/walklists', auth, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT w.*, t.name as territory_name, u.username as assigned_username 
    FROM walklists w
    LEFT JOIN territories t ON w.territory_id = t.id
    LEFT JOIN users u ON w.assigned_to = u.id
  `);
  res.json(rows);
});

// Get my walklists (for volunteers)
app.get('/api/walklists/my', auth, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT w.*, t.name as territory_name,
      (SELECT COUNT(*) FROM voters WHERE territory_id = w.territory_id) as total_voters,
      (SELECT COUNT(*) FROM voters WHERE territory_id = w.territory_id AND contact_status != 'not_contacted') as contacted_voters
    FROM walklists w
    LEFT JOIN territories t ON w.territory_id = t.id
    WHERE w.assigned_to = ?
    ORDER BY w.status, w.created_at DESC
  `, [req.user.id]);
  res.json(rows);
});

// Only admin and manager can create walklists
app.post('/api/walklists', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { name, territory_id, assigned_to } = req.body;
  const [result] = await db.execute(
    'INSERT INTO walklists (name, territory_id, assigned_to) VALUES (?, ?, ?)', 
    [name, territory_id, assigned_to]
  );
  res.json({ message: 'Walklist created', id: result.insertId });
});

// Update walklist status
app.put('/api/walklists/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const completed_at = status === 'completed' ? new Date() : null;
  await db.execute(
    'UPDATE walklists SET status=?, completed_at=? WHERE id=?',
    [status, completed_at, id]
  );
  res.json({ message: 'Walklist updated' });
});

// Update voter contact status (for volunteers during canvassing)
app.put('/api/voters/:id/contact', auth, async (req, res) => {
  const { id } = req.params;
  const { contact_status, notes, sentiment, issues } = req.body;
  
  try {
    // Update voter status
    await db.execute(
      'UPDATE voters SET contact_status=?, last_contacted=NOW() WHERE id=?',
      [contact_status, id]
    );
    
    // Add log entry
    if (notes || sentiment || issues) {
      await db.execute(
        'INSERT INTO logs (voter_id, user_id, sentiment, issues, notes) VALUES (?, ?, ?, ?, ?)', 
        [id, req.user.id, sentiment || null, issues || null, notes || null]
      );
    }
    
    res.json({ message: 'Contact recorded', success: true });
  } catch (err) {
    console.error('Error updating voter contact:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get volunteers list (for assignment)
app.get('/api/users/volunteers', auth, requireRole('admin', 'manager'), async (req, res) => {
  const [rows] = await db.execute('SELECT id, username, role FROM users WHERE role = "volunteer"');
  res.json(rows);
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
