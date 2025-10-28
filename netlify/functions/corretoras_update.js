
const { Pool } = require("pg");
let pool;
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Use POST" };
    if (!process.env.NEON_DB_URL) return { statusCode: 500, body: "NEON_DB_URL não definida" };
    const { id, nome, cnpj, telefone, email, responsavel } = JSON.parse(event.body || "{}");
    if (!id) return { statusCode: 400, body: "Campo 'id' é obrigatório" };
    if (!pool) pool = new Pool({ connectionString: process.env.NEON_DB_URL, ssl:{rejectUnauthorized:false} });
    const q = `UPDATE corretoras SET
                 nome=COALESCE($2,nome),
                 cnpj=COALESCE($3,cnpj),
                 telefone=COALESCE($4,telefone),
                 email=COALESCE($5,email),
                 responsavel=COALESCE($6,responsavel),
                 atualizado_em=NOW()
               WHERE id=$1
               RETURNING id,nome,cnpj,telefone,email,responsavel,criado_em,atualizado_em`;
    const { rows } = await pool.query(q, [id, nome, cnpj, telefone, email, responsavel]);
    if (rows.length===0) return { statusCode:404, body:"Corretora não encontrada" };
    return { statusCode:200, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:true, corretora: rows[0] }) };
  } catch(e) {
    return { statusCode:500, headers:{'content-type':'application/json'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
