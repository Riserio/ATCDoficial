const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
  const token=(event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token); if(!me) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  const { id, nome, cnpj } = JSON.parse(event.body||"{}"); if(!id) return { statusCode:400, body: JSON.stringify({ ok:false, error:"id obrigatório" }) };
  const pool = getPool();
  const { rows } = await pool.query("UPDATE corretoras SET nome=COALESCE($1,nome), cnpj=COALESCE($2,cnpj), updated_at=NOW() WHERE id=$3 RETURNING id,nome,cnpj,created_at,updated_at", [nome, cnpj, id]);
  if(!rows.length) return { statusCode:404, body: JSON.stringify({ ok:false, error:"not found" }) };
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, row: rows[0] }) };
};
