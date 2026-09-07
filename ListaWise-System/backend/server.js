require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { authMiddleware, requireOwner, JWT_SECRET } = require('./authMiddleware');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '64kb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

let demoUsers = [
  {
    id: 1,
    username: 'owner',
    role: 'owner',
    password: 'owner123',
    password_hash: '$2a$10$acouJv4eqVTelzmrfJ9u5Ojd2k1W79lWe0b7Qb9bNmllG6SsStujC',
    name: 'Tindahan ni Aling Rosa (Owner)',
  },
  {
    id: 2,
    username: 'staff',
    role: 'staff',
    password: 'staff123',
    password_hash: '$2a$10$acouJv4eqVTelzmrfJ9u5Ojd2k1W79lWe0b7Qb9bNmllG6SsStujC',
    name: 'Store Cashier Staff',
  },
  {
    id: 3,
    username: 'admin',
    role: 'owner',
    password: '1234',
    password_hash: '$2a$10$acouJv4eqVTelzmrfJ9u5Ojd2k1W79lWe0b7Qb9bNmllG6SsStujC',
    name: 'Administrator',
  },
];

// Auth Endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    if (pool) {
      const result = await pool.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
      const user = result.rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) return res.status(401).json({ error: 'Invalid username or password.' });

      const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } else {
      const user = demoUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

      let isValid = user.password === password;
      if (!isValid && user.password_hash) {
        isValid = await bcrypt.compare(password, user.password_hash);
      }
      if (!isValid) return res.status(401).json({ error: 'Invalid username or password.' });

      const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

app.use('/api', authMiddleware);

app.get('/api/auth/me', (req, res) => {
  const user = demoUsers.find(u => u.id === req.userId) || { id: req.userId, username: req.username, role: req.role, name: req.username };
  res.json({ id: user.id, username: user.username, role: user.role, name: user.name || user.username });
});

app.put('/api/auth/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Current password and a new password (min 4 chars) are required.' });
  }
  const user = demoUsers.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  let isValid = user.password === currentPassword;
  if (!isValid && user.password_hash) {
    isValid = await bcrypt.compare(currentPassword, user.password_hash);
  }
  if (!isValid) return res.status(400).json({ error: 'Current password does not match.' });

  user.password = newPassword;
  user.password_hash = await bcrypt.hash(newPassword, 10);
  return res.json({ success: true, message: 'Password updated successfully.' });
});

app.listen(port, () => {
  console.log(`ListaWise backend server running on http://localhost:${port}`);
});
