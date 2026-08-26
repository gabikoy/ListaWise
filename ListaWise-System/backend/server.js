require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

// PostgreSQL Pool setup
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

// Health Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected (using memory fallback)';
  if (pool) {
    try {
      const result = await pool.query('SELECT NOW()');
      dbStatus = `connected (${result.rows[0].now})`;
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }
  }
  res.json({
    status: 'ok',
    service: 'ListaWise Backend API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`ListaWise backend server running on http://localhost:${port}`);
});
