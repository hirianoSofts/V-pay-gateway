import { cors, getAccessToken, vpayRequest } from './_vpay.js';
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });
  const id = req.query.orderId;
  if (!id) return res.status(400).json({ error: 'orderId obrigatório.' });
  try {
    const token = await getAccessToken();
    const result = await vpayRequest(`/v1/orders/${encodeURIComponent(id)}/status`, { token });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}
