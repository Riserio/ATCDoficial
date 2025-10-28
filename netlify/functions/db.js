/**
 * /.netlify/functions/db
 * Simple Neon PostgreSQL connectivity check using pg Pool.
 */
const { Pool } = require("pg");

let _pool;
function getPool() {
  if (_pool) return _pool;
  _pool = new Pool({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  return _pool;
}

exports.handler = async (event) => {
  try {
    const pool = getPool();
    const q = event.httpMethod === "POST" && event.body
      ? JSON.parse(event.body).query || "SELECT NOW() AS now"
      : "SELECT NOW() AS now";
    const result = await pool.query(q);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true, rows: result.rows })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
