// CommonJS – sem top-level await
const { Pool } = require("pg");

let pool;

exports.handler = async (event) => {
  try {
    const connStr = process.env.NEON_DB_URL;
    if (!connStr) return { statusCode: 500, body: "NEON_DB_URL não definida" };

    if (!pool) {
      pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
    }

    // await só aqui dentro (em função async)
    const result = await pool.query("SELECT NOW() AS now");

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
