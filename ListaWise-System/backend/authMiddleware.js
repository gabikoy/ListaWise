const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'listawise-super-secret-key-change-in-prod-2026';

function authMiddleware(req, res, next) {
  // Support Bearer token header or query parameter (e.g. for CSV export downloads)
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

function requireOwner(req, res, next) {
  if (req.role !== 'owner' && req.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied: Store owner access required.' });
  }
  next();
}

module.exports = { authMiddleware, requireOwner, JWT_SECRET };
