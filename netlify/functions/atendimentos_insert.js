const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
  const token=(event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token); if(!me) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  const b = JSON.parse(event.body||"{}");
  for (const k of ["status","prioridade","corretora","assunto","descricao"]) if(!b[k]) return { statusCode:400, body: JSON.stringify({ ok:false, error:`${k} obrigatório` }) };
  const pool = getPool();
  const { rows } = await pool.query(`INSERT INTO atendimentos
    (owner_id,status,prioridade,corretora,contato,canal,assunto,responsavel,descricao,proximo,follow_on,sla,tags,anexo)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING id,owner_id,created_at,updated_at,status,prioridade,corretora,contato,canal,assunto,responsavel,descricao,proximo,follow_on,sla,tags,anexo`,
    [me.id, b.status, b.prioridade, b.corretora, b.contato||null, b.canal||null, b.assunto, b.responsavel||null, b.descricao, b.proximo||null, b.follow||null, (b.sla===''||b.sla==null)? null : Number(b.sla), Array.isArray(b.tags)? b.tags : null, b.anexo||null]);
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, row: rows[0] }) };
};
