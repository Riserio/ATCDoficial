const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
  const token=(event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token); if(!me) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  const { id } = JSON.parse(event.body||"{}"); if(!id) return { statusCode:400, body: JSON.stringify({ ok:false, error:"id obrigatório" }) };
  const pool = getPool();
  const r = await pool.query("DELETE FROM atendimentos WHERE id=$1", [id]);
  if(!r.rowCount) return { statusCode:404, body: JSON.stringify({ ok:false, error:"not found" }) };
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true }) };
};
