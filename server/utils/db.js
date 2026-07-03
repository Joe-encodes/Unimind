const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

