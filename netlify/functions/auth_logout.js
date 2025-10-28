const { destroySession } = require("./_lib/auth");
exports.handler = async (event)=>{
  const token = (event.headers.authorization||"").replace(/^Bearer\s+/i,"");
  if(event.httpMethod==="POST" && token) await destroySession(token);
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true }) };
};
