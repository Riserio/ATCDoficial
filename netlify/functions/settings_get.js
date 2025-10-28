const { getPool } = require("./_lib/db");
exports.handler = async (event)=>{
  const key = (event.queryStringParameters && event.queryStringParameters.key) || "logo_data_url";
  const pool = getPool();
  const { rows } = await pool.query("SELECT valor FROM app_settings WHERE chave=$1",[key]);
  return { statusCode:200, headers:{ "content-type":"application/json" }, body: JSON.stringify({ ok:true, key, value: rows[0]?.valor || null }) };
};
