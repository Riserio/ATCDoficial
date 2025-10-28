// Salve como UTF-8 sem BOM
const { Pool } = require("pg");

let pool;

exports.handler = async () => {
  const present = !!process.env.NEON_DB_URL;
  // Liste variáveis que começam com "NEON_" sem valores (para debug):
  const keys = Object.keys(process.env).filter(k => k.startsWith("NEON_"));
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ NEON_DB_URL_present: present, env_keys_seen: keys })
  };
};

    if (!pool) {
      pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
      });
    }

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
