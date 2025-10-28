const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
  const token=(event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token); if(!me) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  const { nome, cnpj } = JSON.parse(event.body||"{}"); if(!nome) return { statusCode:400, body: JSON.stringify({ ok:false, error:"nome obrigatório" }) };
  const pool = getPool();
  const { rows } = await pool.query("INSERT INTO corretoras (nome,cnpj) VALUES ($1,$2) RETURNING id,nome,cnpj,created_at,updated_at",[nome, cnpj||null]);
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, row: rows[0] }) };
};
