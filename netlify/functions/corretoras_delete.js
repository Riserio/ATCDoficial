
const { Pool } = require("pg");
let pool;
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Use POST" };
    if (!process.env.NEON_DB_URL) return { statusCode: 500, body: "NEON_DB_URL não definida" };
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return { statusCode: 400, body: "Campo 'id' é obrigatório" };
    if (!pool) pool = new Pool({ connectionString: process.env.NEON_DB_URL, ssl:{rejectUnauthorized:false} });
    const { rows } = await pool.query("DELETE FROM corretoras WHERE id=$1 RETURNING id", [id]);
    if (rows.length===0) return { statusCode:404, body:"Corretora não encontrada" };
    return { statusCode:200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, deleted_id: rows[0].id }) };
  } catch(e) {
    return { statusCode:500, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
