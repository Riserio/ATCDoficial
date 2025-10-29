/**
 * /.netlify/functions/auth_login
 * Login simples com fallback admin/admin e validação opcional via bcryptjs.
 * Responde JSON { ok, token, user }.
 */
const { Pool } = require("pg");
let pool;

// CORS util
const ORIGIN = process.env.CORS_ORIGIN || "*";
function corsHeaders() {
  return {
    "access-control-allow-origin": ORIGIN,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST,OPTIONS",
    "content-type": "application/json"
  };
}

// Safe JSON parse
function tryJson(str){ try { return JSON.parse(str||"{}"); } catch { return {}; } }

// compara senha com bcryptjs se disponível; caso contrário, compara plano
async function checkPassword(input, stored){
  if (!stored) return false;
  if (process.env.AUTH_PLAIN === "1") return input === stored;
  try {
    const bcrypt = require("bcryptjs");
    if (stored.startsWith("$2")) { // parece hash bcrypt
      return await bcrypt.compare(input, stored);
    }
  } catch (e) {
    // bcryptjs não instalado: cai para comparação simples
  }
  return input === stored;
}

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ ok:false, error:"Use POST" }) };
  }

  try {
    const { email, senha } = tryJson(event.body);
    if (!email || !senha) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok:false, error:"Informe email e senha" }) };
    }

    // Fallback DEV: admin/admin
    if ((email === "admin" || email === "admin@demo.local") && senha === "admin") {
      const token = "dev-" + Math.random().toString(36).slice(2);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          ok: true,
          token,
          user: { id: 1, nome: "Administrador (DEMO)", email: "admin@demo.local", role: "admin" }
        })
      };
    }

    // Checagem real no banco (tabela 'usuarios')
    if (!process.env.NEON_DB_URL) {
      return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ ok:false, error:"NEON_DB_URL não definida" }) };
    }
    if (!pool) pool = new Pool({ connectionString: process.env.NEON_DB_URL, ssl: { rejectUnauthorized: false } });

    // Suporta email ou username
    const q = `SELECT id, nome, email, role, senha_hash
               FROM usuarios
               WHERE email = $1 OR lower(email) = lower($1)
               LIMIT 1`;
    const { rows } = await pool.query(q, [email]);
    if (!rows.length) {
      return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ ok:false, error:"Usuário não encontrado" }) };
    }
    const u = rows[0];
    const ok = await checkPassword(senha, u.senha_hash);
    if (!ok) {
      return { statusCode: 401, headers: corsHeaders(), body: JSON.stringify({ ok:false, error:"Senha inválida" }) };
    }

    // Gera um token simples (substitua por JWT se desejar)
    const token = "tok-" + Math.random().toString(36).slice(2);
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        ok: true,
        token,
        user: { id: u.id, nome: u.nome, email: u.email, role: u.role || "user" }
      })
    };
  } catch (e) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
