const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  const token=(event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token); if(!me) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  const pool = getPool();
  const { rows } = await pool.query(`SELECT id,owner_id,created_at,updated_at,status,prioridade,corretora,contato,canal,assunto,responsavel,descricao,proximo,follow_on,sla,tags,anexo FROM atendimentos ORDER BY id DESC`);
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, rows }) };
};
