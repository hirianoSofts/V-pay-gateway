const BASE = (process.env.VPAY_API_BASE || 'https://api.vpay.co.mz').replace(/\/$/, '');

export function cors(req, res) {
  const origin = req.headers.origin;
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (origin && (allowed.includes('*') || allowed.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}

export async function vpayRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { raw }; }
  if (!response.ok) {
    const error = new Error(data.message || data.error || `VPay respondeu HTTP ${response.status}`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

export async function getAccessToken() {
  const client_id = process.env.VPAY_CLIENT_ID;
  const client_secret = process.env.VPAY_CLIENT_SECRET;
  if (!client_id || !client_secret) throw new Error('Configure VPAY_CLIENT_ID e VPAY_CLIENT_SECRET no Vercel.');
  const data = await vpayRequest('/v1/auth/token', { method: 'POST', body: { client_id, client_secret } });
  const token = data.access_token || data.accessToken || data.data?.access_token || data.data?.accessToken;
  if (!token) throw new Error('A autenticação VPay não devolveu access_token. Verifique a resposta/API da sua conta.');
  return token;
}
