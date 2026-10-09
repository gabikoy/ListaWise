const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not set; skipping database schema initialization.');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    const schema = await fs.readFile(path.join(__dirname, 'database.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema is ready.');
  } catch (err) {
    console.error('Warning: Database schema initialization error:', err.message);
  } finally {
    await pool.end();
  }
}

setupDatabase().catch((error) => {
  console.error('Database setup error:', error);
});
