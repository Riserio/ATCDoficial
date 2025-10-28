const { getPool } = require("./_lib/db");
const { getUserByToken } = require("./_lib/auth");
exports.handler = async (event)=>{
  if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
  const token = (event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const me = await getUserByToken(token);
  if(!me || me.perfil!=="admin") return { statusCode:403, body: JSON.stringify({ ok:false, error:"forbidden" }) };
  const { key="logo_data_url", value=null } = JSON.parse(event.body||"{}");
  const pool = getPool();
  await pool.query(
    "INSERT INTO app_settings (chave,valor) VALUES ($1,$2) ON CONFLICT (chave) DO UPDATE SET valor=EXCLUDED.valor",
    [key, value]
  );
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true }) };
};
