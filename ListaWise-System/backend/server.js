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

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*', // Allow development frontend clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '64kb' }));

// Health Check Endpoints for Render and Monitoring
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'listawise-api',
    time: new Date().toISOString(),
  });
});

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Database pool setup (with Render SSL support)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

// Demo Store Users
let demoUsers = [
  {
    id: 1,
    username: 'owner',
    role: 'owner',
    password: 'owner123', // Demo plain password
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

// Rich Demo Customers Data
let demoCustomers = [
  {
    id: 1,
    name: 'Lita Cruz',
    phone: '0917-111-2233',
    address: 'Block 4 Lot 12, Barangay San Roque, Pasay City',
    credit_limit: 1500,
    days_outstanding: 92,
    created_at: new Date(Date.now() - 92 * 86400000).toISOString(),
  },
  {
    id: 2,
    name: 'Maria Santos',
    phone: '0917-222-3344',
    address: '15 Rosal St, Cubao, Quezon City',
    credit_limit: 1000,
    days_outstanding: 61,
    created_at: new Date(Date.now() - 61 * 86400000).toISOString(),
  },
  {
    id: 3,
    name: 'Ana Flores',
    phone: '0917-333-4455',
    address: 'Sitio Kawayan, Cebu City',
    credit_limit: 800,
    days_outstanding: 18,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 4,
    name: 'Rico Dela Cruz',
    phone: '0917-444-5566',
    address: 'Km 7 Bangkal, Davao City',
    credit_limit: 1200,
    days_outstanding: 12,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 5,
    name: 'Jose Reyes',
    phone: '0918-555-6677',
    address: 'Purok 3, Tagum City',
    credit_limit: 1000,
    days_outstanding: 45,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 6,
    name: 'Danny Villanueva',
    phone: '0919-666-7788',
    address: 'Zone 2, Barangay Carmen, CDO',
    credit_limit: 600,
    days_outstanding: 10,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 7,
    name: 'Elena Bautista',
    phone: '0920-777-8899',
    address: '77 Acacia Lane, Marikina City',
    credit_limit: 2000,
    days_outstanding: 0,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Rich Demo Debts Data
let demoDebts = [
  {
    id: 101,
    customer_id: 1,
    amount: 520,
    description: '2 sacks of Rice (25kg) & Cooking oil',
    created_at: new Date(Date.now() - 92 * 86400000).toISOString(),
  },
  {
    id: 102,
    customer_id: 1,
    amount: 300,
    description: 'Canned goods and grocery items',
    created_at: new Date(Date.now() - 65 * 86400000).toISOString(),
  },
  {
    id: 103,
    customer_id: 2,
    amount: 350,
    description: 'Pork & Chicken meat advance',
    created_at: new Date(Date.now() - 61 * 86400000).toISOString(),
  },
  {
    id: 104,
    customer_id: 2,
    amount: 250,
    description: 'Laundry detergent & toiletries',
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 105,
    customer_id: 3,
    amount: 430,
    description: 'Snacks, coffee and canned milk',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 106,
    customer_id: 4,
    amount: 260,
    description: 'Softdrinks case & crackers',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 107,
    customer_id: 5,
    amount: 350,
    description: 'Eggs (1 tray) & cooking ingredients',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 108,
    customer_id: 6,
    amount: 180,
    description: 'Bread and sandwich spread',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 109,
    customer_id: 7,
    amount: 500,
    description: 'Holiday grocery package',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Rich Demo Payments Data
let demoPayments = [
  {
    id: 201,
    customer_id: 1,
    amount: 150,
    payment_method: 'Cash',
    notes: 'Partial payment on rice',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 202,
    customer_id: 2,
    amount: 115,
    payment_method: 'GCash',
    notes: 'GCash Ref #4928192831',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 203,
    customer_id: 3,
    amount: 90,
    payment_method: 'Cash',
    notes: 'Cash payment from salary',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 204,
    customer_id: 4,
    amount: 50,
    payment_method: 'Cash',
    notes: 'Partial cash payment',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 205,
    customer_id: 5,
    amount: 120,
    payment_method: 'Cash',
    notes: 'Partial payment received',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 206,
    customer_id: 6,
    amount: 85,
    payment_method: 'Cash',
    notes: 'Weekly installment',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 207,
    customer_id: 7,
    amount: 500,
    payment_method: 'GCash',
    notes: 'Fully settled via GCash',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const demoStore = {
  customers: demoCustomers,
  debts: demoDebts,
  payments: demoPayments,
};
const userStores = new Map([
  [1, demoStore],
  [2, demoStore],
  [3, demoStore],
]);

function createEmptyStore() {
  return { customers: [], debts: [], payments: [] };
}

function getStore(userId) {
  return userStores.get(Number(userId));
}

// Helper to compute complete customer ledger summary
function calcCustomerSummary(customerId, store) {
  const customer = store.customers.find((item) => item.id === customerId);
  if (!customer) return null;

  const debts = store.debts
    .filter((item) => item.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const payments = store.payments
    .filter((item) => item.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalDebt = debts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalPaid = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = Math.max(totalDebt - totalPaid, 0);

  // Compute Days Outstanding from oldest unpaid debt if balance > 0
  let daysOutstanding = customer.days_outstanding || 0;
  if (balance <= 0) {
    daysOutstanding = 0;
  }

  // Risk Classification Rule Engine
  let risk = 'LOW';
  let riskScore = 20; // 0-100 scale

  if (balance > 0) {
    if (daysOutstanding >= 60) {
      risk = 'HIGH';
      riskScore = 85;
    } else if (daysOutstanding >= 30) {
      risk = 'HIGH';
      riskScore = 70;
    } else if (daysOutstanding >= 15) {
      risk = 'MODERATE';
      riskScore = 45;
    } else {
      risk = 'LOW';
      riskScore = 20;
    }
  }

  // Combine Debts and Payments into chronological Audit History
  const history = [
    ...debts.map((d) => ({
      id: `debt-${d.id}`,
      original_id: d.id,
      type: 'debt',
      amount: d.amount,
      note: d.description || 'Credit / Utang record',
      created_at: d.created_at,
    })),
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      original_id: p.id,
      type: 'payment',
      amount: p.amount,
      payment_method: p.payment_method || 'Cash',
      note: p.notes || 'Payment received',
      created_at: p.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Compute running balance for history
  let currentRun = totalDebt - totalPaid;
  const historyWithRunning = history.map((tx) => {
    const item = { ...tx, running_balance: Math.max(currentRun, 0) };
    if (tx.type === 'debt') {
      currentRun -= tx.amount;
    } else {
      currentRun += tx.amount;
    }
    return item;
  });

  return {
    ...customer,
    balance: Number(balance.toFixed(2)),
    total_debt: Number(totalDebt.toFixed(2)),
    total_paid: Number(totalPaid.toFixed(2)),
    days_outstanding: daysOutstanding,
    risk,
    risk_score: riskScore,
    late_payments_count: daysOutstanding >= 30 ? 1 : 0,
    transaction_count: debts.length + payments.length,
    avg_days_to_repayment: Math.max(Math.floor(daysOutstanding * 0.6), 5),
    debts,
    payments,
    history: historyWithRunning,
  };
}

function getCustomerList(store) {
  return store.customers
    .map((customer) => calcCustomerSummary(customer.id, store))
    .filter(Boolean);
}

function sanitizeCustomerPayload(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const address = typeof body?.address === 'string' ? body.address.trim() : '';
  const credit_limit = Number(body?.credit_limit || 1000);
  return { name, phone, address, credit_limit };
}

function computeDashboard(store) {
  const items = getCustomerList(store);
  const totalOutstanding = items.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  const totalCollected = store.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalCreditIssued = store.debts.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const activeWithBalance = items.filter((item) => item.balance > 0);
  const overdueCount = items.filter((item) => Number(item.days_outstanding || 0) >= 30).length;
  const highRiskCount = items.filter((item) => item.risk === 'HIGH').length;

  const longestOutstanding = [...items]
    .filter((item) => item.balance > 0)
    .sort((a, b) => Number(b.days_outstanding || 0) - Number(a.days_outstanding || 0))
    .slice(0, 5);

  const recentTransactions = [
    ...store.debts.map((d) => {
      const c = store.customers.find((cust) => cust.id === d.customer_id);
      return {
        id: `d-${d.id}`,
        customer_name: c ? c.name : 'Unknown Customer',
        customer_id: d.customer_id,
        type: 'debt',
        amount: d.amount,
        description: d.description,
        created_at: d.created_at,
      };
    }),
    ...store.payments.map((p) => {
      const c = store.customers.find((cust) => cust.id === p.customer_id);
      return {
        id: `p-${p.id}`,
        customer_name: c ? c.name : 'Unknown Customer',
        customer_id: p.customer_id,
        type: 'payment',
        amount: p.amount,
        payment_method: p.payment_method || 'Cash',
        description: p.notes,
        created_at: p.created_at,
      };
    }),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const collectionRate = totalCreditIssued > 0
    ? Math.min(Math.round((totalCollected / totalCreditIssued) * 100), 100)
    : 100;

  return {
    totalOutstanding: Number(totalOutstanding.toFixed(2)),
    totalCollected: Number(totalCollected.toFixed(2)),
    totalCreditIssued: Number(totalCreditIssued.toFixed(2)),
    totalCustomers: items.length,
    activeCustomers: activeWithBalance.length,
    overdueCount,
    highRiskCount,
    collectionRate,
    longestOutstanding,
    recentTransactions,
  };
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'ListaWise Digital Utang Management System',
    version: '2.0.0',
    mode: pool ? 'postgresql' : 'in-memory-demo',
    timestamp: new Date().toISOString(),
  });
});

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
app.get('/api/auth/setup-required', (_req, res) => {
  res.json({ setupRequired: false });
});

const handleLogin = async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    let user = null;

    if (pool) {
      try {
        const result = await pool.query(
          'SELECT id, username, password_hash, role, name FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
          [username]
        );
        user = result.rows[0];
      } catch (dbErr) {
        console.warn('Database query fallback:', dbErr.message);
      }
    }

    if (!user) {
      user = demoUsers.find(
        (candidate) => candidate.username.toLowerCase() === username.toLowerCase()
      );
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Check password (either bcrypt or demo plain match)
    let passwordMatches = false;
    if (user.password_hash && password.length >= 4) {
      try {
        passwordMatches = await bcrypt.compare(password, user.password_hash);
      } catch (_) {
        passwordMatches = false;
      }
    }
    if (!passwordMatches && user.password) {
      passwordMatches = user.password === password;
    }

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (pool && !getStore(user.id)) {
      userStores.set(Number(user.id), createEmptyStore());
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name || user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication service encountered an error.' });
  }
};

app.post('/api/login', authLimiter, handleLogin);
app.post('/api/auth/login', authLimiter, handleLogin);

// ─── Registration Endpoint ────────────────────────────────────────────────────
const handleRegister = async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : (req.body?.store_name || username);
  const role = req.body?.role === 'staff' ? 'staff' : 'owner';

  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  try {
    // Check if username already exists
    if (pool) {
      try {
        const existing = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1', [username]);
        if (existing.rows.length > 0) {
          return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const inserted = await pool.query(
          'INSERT INTO users (username, password_hash, role, name) VALUES ($1, $2, $3, $4) RETURNING id, username, role, name',
          [username, passwordHash, role, name]
        );
        const newUser = inserted.rows[0];
        userStores.set(Number(newUser.id), createEmptyStore());

        const token = jwt.sign(
          { userId: newUser.id, username: newUser.username, role: newUser.role },
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        return res.status(201).json({
          token,
          user: newUser,
          message: 'Account registered successfully.',
        });
      } catch (dbErr) {
        console.warn('Database register fallback:', dbErr.message);
      }
    } else {
      const existing = demoUsers.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
      }

      const nextId = demoUsers.reduce((max, u) => Math.max(max, u.id), 0) + 1;
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        id: nextId,
        username,
        role,
        name: name || username,
        password,
        password_hash: passwordHash,
      };

      demoUsers.push(newUser);
      userStores.set(newUser.id, createEmptyStore());

      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          name: newUser.name,
        },
        message: 'Account registered successfully.',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create store account. Please try again.' });
  }
};

app.post('/api/register', authLimiter, handleRegister);
app.post('/api/auth/register', authLimiter, handleRegister);

// ─── Authenticated Routes ─────────────────────────────────────────────────────
app.use('/api', authMiddleware);
app.use('/api', (req, res, next) => {
  let store = getStore(req.userId);
  if (!store && pool) {
    store = createEmptyStore();
    userStores.set(Number(req.userId), store);
  }
  if (!store) {
    return res.status(401).json({ error: 'No ledger is associated with this account.' });
  }
  req.store = store;
  return next();
});

app.get('/api/auth/me', (req, res) => {
  const user = demoUsers.find((u) => u.id === req.userId) || {
    id: req.userId,
    username: req.username,
    role: req.role,
    name: req.username,
  };
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name || user.username,
  });
});

app.put('/api/auth/password', async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === 'string'
    ? req.body.currentPassword
    : '';
  const newPassword = typeof req.body?.newPassword === 'string'
    ? req.body.newPassword
    : '';

  if (!currentPassword || newPassword.length < 4) {
    return res.status(400).json({
      error: 'Current password and a new password of at least 4 characters are required.',
    });
  }

  try {
    if (pool) {
      const result = await pool.query(
        'SELECT id, password_hash FROM users WHERE id = $1 LIMIT 1',
        [req.userId]
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentValid) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, req.userId]
      );
    } else {
      const userIndex = demoUsers.findIndex((user) => user.id === req.userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User account not found.' });
      }

      const user = demoUsers[userIndex];
      let isCurrentValid = user.password === currentPassword;
      if (!isCurrentValid && user.password_hash) {
        isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
      }

      if (!isCurrentValid) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }

      user.password = newPassword;
      user.password_hash = await bcrypt.hash(newPassword, 10);
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// ─── Dashboard & Analytics ────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  res.json(computeDashboard(req.store));
});

app.get('/api/overdue', (req, res) => {
  const overdue = getCustomerList(req.store)
    .filter((c) => Number(c.days_outstanding || 0) >= 30 && c.balance > 0)
    .sort((a, b) => b.days_outstanding - a.days_outstanding);
  res.json(overdue);
});

app.get('/api/risk', (req, res) => {
  const list = getCustomerList(req.store);
  const summary = {
    highRisk: list.filter((c) => c.risk === 'HIGH' && c.balance > 0),
    moderateRisk: list.filter((c) => c.risk === 'MODERATE' && c.balance > 0),
    lowRisk: list.filter((c) => c.risk === 'LOW' && c.balance > 0),
    cleared: list.filter((c) => c.balance <= 0),
    all: list,
  };
  res.json(summary);
});

app.get('/api/reports/summary', (req, res) => {
  const list = getCustomerList(req.store);
  const totalBalance = list.reduce((sum, c) => sum + c.balance, 0);

  const aging = {
    current_0_15: list.filter((c) => c.balance > 0 && c.days_outstanding <= 15),
    aging_16_30: list.filter((c) => c.balance > 0 && c.days_outstanding > 15 && c.days_outstanding <= 30),
    aging_31_60: list.filter((c) => c.balance > 0 && c.days_outstanding > 30 && c.days_outstanding <= 60),
    aging_over_60: list.filter((c) => c.balance > 0 && c.days_outstanding > 60),
  };

  const agingTotals = {
    current_0_15: aging.current_0_15.reduce((s, c) => s + c.balance, 0),
    aging_16_30: aging.aging_16_30.reduce((s, c) => s + c.balance, 0),
    aging_31_60: aging.aging_31_60.reduce((s, c) => s + c.balance, 0),
    aging_over_60: aging.aging_over_60.reduce((s, c) => s + c.balance, 0),
  };

  res.json({
    totalOutstanding: Number(totalBalance.toFixed(2)),
    totalCustomers: list.length,
    aging,
    agingTotals,
    generatedAt: new Date().toISOString(),
  });
});

app.post('/api/chat', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  const customers = getCustomerList(req.store);
  const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const highRisk = customers.filter((c) => c.risk === 'HIGH');
  const mostOverdue = [...customers].sort((a, b) => (b.days_outstanding || 0) - (a.days_outstanding || 0))[0];

  const customerSummary = customers
    .map((customer) => `${customer.name}: ₱${Number(customer.balance || 0).toFixed(2)} balance, ${customer.days_outstanding || 0} days outstanding, ${customer.risk || 'UNKNOWN'} risk`)
    .join('\n');

  // Intelligent local fallback if OpenRouter is unreachable or credit-limited
  const getLocalFallbackReply = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes('total utang') || lower.includes('total balance') || lower.includes('how much debt')) {
      return `The total outstanding debt across all ${customers.length} customer(s) is ₱${totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
    }
    if (lower.includes('high risk') || lower.includes('who is high risk') || lower.includes("who's high risk")) {
      if (highRisk.length === 0) return 'Great news! There are currently no high-risk customers recorded in your store ledger.';
      return `There are currently ${highRisk.length} high-risk customer(s):\n` + highRisk.map(c => `• ${c.name} (₱${c.balance.toFixed(2)} - ${c.days_outstanding} days overdue)`).join('\n');
    }
    if (lower.includes('most overdue') || lower.includes('oldest debt') || lower.includes('overdue')) {
      if (!mostOverdue || mostOverdue.balance <= 0) return 'All customer balances are currently up to date!';
      return `The most overdue customer is ${mostOverdue.name} with an outstanding balance of ₱${mostOverdue.balance.toFixed(2)} (${mostOverdue.days_outstanding} days outstanding).`;
    }
    if (lower.includes('reminder') || lower.includes('draft')) {
      const matched = customers.find(c => lower.includes(c.name.toLowerCase())) || mostOverdue;
      if (matched) {
        return `Magandang araw po, ${matched.name}! Paalala lang po mula sa tindahan ukol sa inyong balance na ₱${matched.balance.toFixed(2)} (${matched.days_outstanding} days outstanding). Maaari po kayong mag-settle sa tindahan. Maraming salamat po!`;
      }
    }
    // Check if user is asking about a specific customer
    const foundCustomer = customers.find(c => lower.includes(c.name.toLowerCase()));
    if (foundCustomer) {
      return `${foundCustomer.name}: Outstanding balance of ₱${foundCustomer.balance.toFixed(2)}, ${foundCustomer.days_outstanding} days outstanding, Risk level: ${foundCustomer.risk}.`;
    }
    return `Hello po! I am your ListaWise store assistant. Total active utang is ₱${totalBalance.toFixed(2)} across ${customers.length} customer(s). You can ask me about total utang, who is high risk, most overdue customers, or draft payment reminders!`;
  };

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({ reply: getLocalFallbackReply(message) });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    let response;
    let data;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-OpenRouter-Title': 'ListaWise',
        'HTTP-Referer': 'http://localhost:3000',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: `You are ListaWise AI, a concise and friendly assistant for a sari-sari store in the Philippines. Answer questions accurately based only on the store credit records below. Use Philippine pesos (₱) and polite English or Taglish.\n\nStore Credit Records:\n${customerSummary || 'No customer records available.'}`,
          },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
        signal: controller.signal,
      });

      data = await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok || !data.choices?.[0]?.message?.content) {
      console.warn('OpenRouter returned non-OK status, switching to local store assistant fallback:', data?.error?.message);
      return res.json({ reply: getLocalFallbackReply(message) });
    }

    return res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Chat request error, using fallback:', error.message);
    return res.json({ reply: getLocalFallbackReply(message) });
  }
});

// ─── CSV Export Endpoint ──────────────────────────────────────────────────────
app.get('/api/export', (req, res) => {
  const list = getCustomerList(req.store);
  let csv = 'ID,Name,Phone,Address,Total Debt (PHP),Total Paid (PHP),Balance (PHP),Days Outstanding,Risk Status,Created At\n';

  list.forEach((c) => {
    const row = [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.total_debt.toFixed(2),
      c.total_paid.toFixed(2),
      c.balance.toFixed(2),
      c.days_outstanding,
      c.risk,
      c.created_at,
    ];
    csv += row.join(',') + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="ListaWise_Ledger_${Date.now()}.csv"`);
  res.status(200).send(csv);
});

// ─── Customers CRUD ───────────────────────────────────────────────────────────
app.get('/api/customers', (req, res) => {
  let list = getCustomerList(req.store);
  const q = typeof req.query?.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const riskFilter = typeof req.query?.risk === 'string' ? req.query.risk.toUpperCase() : '';

  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }

  if (riskFilter && ['HIGH', 'LOW', 'MODERATE'].includes(riskFilter)) {
    list = list.filter((c) => c.risk === riskFilter);
  }

  res.json(list);
});

app.get('/api/customers/:id', (req, res) => {
  const customerId = Number(req.params.id);
  const customer = calcCustomerSummary(customerId, req.store);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }
  return res.json(customer);
});

app.post('/api/customers', requireOwner, (req, res) => {
  const payload = sanitizeCustomerPayload(req.body);
  if (!payload.name) {
    return res.status(400).json({ error: 'Customer full name is required.' });
  }

  const { customers } = req.store;
  const nextId = customers.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const customer = {
    id: nextId,
    name: payload.name,
    phone: payload.phone,
    address: payload.address,
    credit_limit: payload.credit_limit,
    days_outstanding: 0,
    created_at: new Date().toISOString(),
  };

  customers.push(customer);
  return res.status(201).json(calcCustomerSummary(customer.id, req.store));
});

app.put('/api/customers/:id', requireOwner, (req, res) => {
  const customerId = Number(req.params.id);
  const { customers } = req.store;
  const index = customers.findIndex((item) => item.id === customerId);
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const payload = sanitizeCustomerPayload(req.body);
  if (!payload.name) {
    return res.status(400).json({ error: 'Customer full name is required.' });
  }

  customers[index] = {
    ...customers[index],
    name: payload.name,
    phone: payload.phone,
    address: payload.address,
    credit_limit: payload.credit_limit || customers[index].credit_limit,
  };

  return res.json(calcCustomerSummary(customerId, req.store));
});

app.delete('/api/customers/:id', requireOwner, (req, res) => {
  const customerId = Number(req.params.id);
  const { customers, debts, payments } = req.store;
  const index = customers.findIndex((item) => item.id === customerId);
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  customers.splice(index, 1);
  req.store.debts = debts.filter((item) => item.customer_id !== customerId);
  req.store.payments = payments.filter((item) => item.customer_id !== customerId);

  return res.json({ success: true, message: 'Customer and all records removed.' });
});

// ─── Debts & Payments Endpoints ───────────────────────────────────────────────
app.post('/api/customers/:id/debts', requireOwner, (req, res) => {
  const customerId = Number(req.params.id);
  const { customers, debts } = req.store;
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const amount = Number(req.body?.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid positive debt amount.' });
  }

  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    customer_id: customerId,
    amount: Number(amount.toFixed(2)),
    description: typeof req.body?.description === 'string' && req.body.description.trim()
      ? req.body.description.trim()
      : 'Store credit / grocery items',
    created_at: new Date().toISOString(),
  };

  debts.push(entry);

  // Update customer days if it was 0
  if ((customer.days_outstanding || 0) === 0) {
    customer.days_outstanding = 1;
  }

  return res.status(201).json({
    debt: entry,
    customerSummary: calcCustomerSummary(customerId, req.store),
  });
});

app.post('/api/customers/:id/payments', requireOwner, (req, res) => {
  const customerId = Number(req.params.id);
  const { customers, payments } = req.store;
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found.' });
  }

  const amount = Number(req.body?.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid positive payment amount.' });
  }

  const paymentMethod = typeof req.body?.payment_method === 'string' && req.body.payment_method.trim()
    ? req.body.payment_method.trim()
    : 'Cash';

  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    customer_id: customerId,
    amount: Number(amount.toFixed(2)),
    payment_method: paymentMethod,
    notes: typeof req.body?.notes === 'string' ? req.body.notes.trim() : 'Payment received',
    created_at: new Date().toISOString(),
  };

  payments.push(entry);

  const summary = calcCustomerSummary(customerId, req.store);
  if (summary.balance <= 0) {
    customer.days_outstanding = 0;
  }

  return res.status(201).json({
    payment: entry,
    customerSummary: summary,
  });
});

app.delete('/api/debts/:id', requireOwner, (req, res) => {
  const debtId = Number(req.params.id);
  const { debts } = req.store;
  const target = debts.find((item) => item.id === debtId);
  if (!target) {
    return res.status(404).json({ error: 'Debt record not found.' });
  }

  req.store.debts = debts.filter((item) => item.id !== debtId);
  return res.json({
    success: true,
    customerSummary: calcCustomerSummary(target.customer_id, req.store),
  });
});

app.delete('/api/payments/:id', requireOwner, (req, res) => {
  const paymentId = Number(req.params.id);
  const { payments } = req.store;
  const target = payments.find((item) => item.id === paymentId);
  if (!target) {
    return res.status(404).json({ error: 'Payment record not found.' });
  }

  req.store.payments = payments.filter((item) => item.id !== paymentId);
  return res.json({
    success: true,
    customerSummary: calcCustomerSummary(target.customer_id, req.store),
  });
});

// Start Server
app.listen(port, () => {
  console.log(`\n=================================================`);
  console.log(`  ListaWise API Server running on port ${port}`);
  console.log(`  Health Check: http://localhost:${port}/health`);
  console.log(`  Mode: ${pool ? 'PostgreSQL' : 'In-Memory Demo Storage'}`);
  console.log(`=================================================\n`);
});
