
const { Pool } = require("pg");
let pool;
exports.handler = async () => {
  try {
    if (!process.env.NEON_DB_URL) return { statusCode: 500, body: "NEON_DB_URL não definida" };
    if (!pool) pool = new Pool({ connectionString: process.env.NEON_DB_URL, ssl:{rejectUnauthorized:false} });
    const sql = `SELECT id,nome,cnpj,telefone,email,responsavel,criado_em,atualizado_em FROM corretoras ORDER BY id DESC LIMIT 500`;
    const { rows } = await pool.query(sql);
    return { statusCode:200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, rows }) };
  } catch(e) {
    return { statusCode:500, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
