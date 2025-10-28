
const { Pool } = require("pg");
let pool;
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Use POST" };
    if (!process.env.NEON_DB_URL) return { statusCode: 500, body: "NEON_DB_URL não definida" };
    const { nome, cnpj, telefone, email, responsavel } = JSON.parse(event.body || "{}");
    if (!nome) return { statusCode: 400, body: "Campo 'nome' é obrigatório" };
    if (!pool) pool = new Pool({ connectionString: process.env.NEON_DB_URL, ssl:{rejectUnauthorized:false} });
    const q = `INSERT INTO corretoras (nome,cnpj,telefone,email,responsavel) VALUES ($1,$2,$3,$4,$5)
               RETURNING id,nome,cnpj,telefone,email,responsavel,criado_em,atualizado_em`;
    const { rows } = await pool.query(q, [nome, cnpj || null, telefone || null, email || null, responsavel || null]);
    return { statusCode:200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, corretora: rows[0] }) };
  } catch(e) {
    return { statusCode:500, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
