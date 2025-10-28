const { getPool } = require("./_lib/db");
const { issueSession } = require("./_lib/auth");
const bcrypt = require("bcryptjs");
exports.handler = async (event)=>{
  try{
    if(event.httpMethod!=="POST") return { statusCode:405, body:"Use POST" };
    const { email, senha } = JSON.parse(event.body||"{}");
    if(!email || !senha) return json(400,{ ok:false, error:"Email e senha obrigatórios" });
    const pool = getPool();
    const { rows } = await pool.query("SELECT id,nome,email,perfil,senha_hash FROM usuarios WHERE email=$1",[email]);
    const u = rows[0]; if(!u) return json(401,{ ok:false, error:"Credenciais inválidas" });
    const ok = await bcrypt.compare(senha, u.senha_hash); if(!ok) return json(401,{ ok:false, error:"Credenciais inválidas" });
    const token = await issueSession(u.id);
    return json(200,{ ok:true, token, user:{ id:u.id, nome:u.nome, email:u.email, perfil:u.perfil } });
  }catch(e){ return json(500,{ ok:false, error:e.message }); }
};
function json(code,obj){ return { statusCode:code, headers:{ "content-type":"application/json" }, body: JSON.stringify(obj) }; }
