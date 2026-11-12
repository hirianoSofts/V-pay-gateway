import { PRODUCTS } from '../config/products.js';
import { cors, getAccessToken, vpayRequest } from './_vpay.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const { productId, quantity = 1, customer = {} } = req.body || {};
    const product = PRODUCTS[productId];
    if (!product) return res.status(404).json({ error: 'Produto não encontrado no catálogo do backend.' });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return res.status(400).json({ error: 'Quantidade inválida (1 a 10).' });
    if (!customer.name || !customer.email) return res.status(400).json({ error: 'Informe nome e email do comprador.' });

    const token = await getAccessToken();
    const order = await vpayRequest('/v1/orders', {
      method: 'POST', token,
      body: {
        source: { source: 'api' },
        customer: {
          name: String(customer.name).slice(0, 120),
          email: String(customer.email).slice(0, 180),
          ...(customer.phone ? { phone: String(customer.phone).slice(0, 30) } : {})
        },
        shippingAddressDisabled: true,
        deliveryInfoDisabled: true,
        items: [{
          originProductId: product.originProductId,
          name: product.name,
          quantity: qty,
          price: product.price
        }]
      }
    });

    const payload = order.data || order;
    const paymentUrl = payload.checkoutUrl || payload.checkout_url || payload.paymentUrl || payload.payment_url || payload.url || order.checkoutUrl || order.paymentUrl;
    const orderId = payload.orderId || payload.order_id || payload.id || order.orderId || order.id;
    if (!paymentUrl) {
      // Não inventamos URL de checkout: devolvemos resposta para diagnóstico sem expor credenciais.
      return res.status(502).json({ error: 'A VPay criou/respondeu ao pedido, mas não foi encontrado o URL de checkout na resposta.', vpayResponse: order });
    }
    return res.status(200).json({ checkoutUrl: paymentUrl, orderId, product: product.name, amount: product.price * qty, currency: product.currency });
  } catch (error) {
    console.error('VPay checkout error:', error.message, error.details || '');
    return res.status(error.status || 500).json({ error: error.message || 'Não foi possível iniciar o pagamento.' });
  }
}
