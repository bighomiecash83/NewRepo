const functions = require('firebase-functions');
const { Pool } = require('pg');

const connectionString = functions.config().postgres?.uri;
if (!connectionString) {
  console.warn('Missing functions config: postgres.uri — Postgres disabled');
}

const pool = connectionString ? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
}) : null;

module.exports = {
  query: async (text, params) => {
    if (!pool) throw new Error('Postgres not configured');
    return pool.query(text, params);
  },
  pool,
  isAvailable: () => !!pool,
};
