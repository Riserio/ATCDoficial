const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
  const token=(event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token); if(!me) return { statusCode:401, body: JSON.stringify({ ok:false }) };
  const b = JSON.parse(event.body||"{}"); const id=b.id;
  if(!id) return { statusCode:400, body: JSON.stringify({ ok:false, error:"id obrigatório" }) };
  const fields=["status","prioridade","corretora","contato","canal","assunto","responsavel","descricao","proximo","anexo"];
  const parts=[]; const vals=[]; let i=1;
  function set(col,val){ parts.push(col+"=$"+(i++)); vals.push(val); }
  for(const f of fields){ if(b[f]!==undefined) set(f, b[f]); }
  if(b.follow!==undefined) set("follow_on", b.follow);
  if(b.sla!==undefined) set("sla", (b.sla===''||b.sla==null)? null : Number(b.sla));
  if(b.tags!==undefined) set("tags", Array.isArray(b.tags)? b.tags : null);
  parts.push("updated_at=NOW()"); vals.push(id);
  const pool = getPool();
  const { rows } = await pool.query(`UPDATE atendimentos SET ${parts.join(", ")} WHERE id=$${i} RETURNING id,owner_id,created_at,updated_at,status,prioridade,corretora,contato,canal,assunto,responsavel,descricao,proximo,follow_on,sla,tags,anexo`, vals);
  if(!rows.length) return { statusCode:404, body: JSON.stringify({ ok:false, error:"not found" }) };
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, row: rows[0] }) };
};
