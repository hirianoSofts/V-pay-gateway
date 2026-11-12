# Backend central VPay (Vercel)

Este projecto centraliza as credenciais VPay e cria pedidos. Os preços são definidos em `config/products.js`, no servidor — não no site público nem em variáveis de ambiente.

## Deploy
1. Crie um repositório GitHub separado e envie TODO o conteúdo desta pasta.
2. Importe o repositório em Vercel.
3. Em Project → Settings → Environment Variables, crie apenas:
   - `VPAY_CLIENT_ID`
   - `VPAY_CLIENT_SECRET`
   - `VPAY_API_BASE` = `https://api.vpay.co.mz` (opcional; já é o padrão)
   - `ALLOWED_ORIGINS` = domínio(s) exactos dos sites autorizados, separados por vírgula.
4. Faça Deploy. O backend ficará, por exemplo, em `https://vpay-central.vercel.app`.

## Endpoint para qualquer site
`POST https://SEU-BACKEND.vercel.app/api/checkout`

JSON:
```json
{
  "productId": "headphones-demo",
  "quantity": 1,
  "customer": { "name": "Nome do cliente", "email": "cliente@email.com", "phone": "+258841234567" }
}
```

Resposta esperada: `{ "checkoutUrl": "https://...", "orderId": "...", "amount": 850, "currency": "MZN" }`.
O site deve redireccionar o comprador para `checkoutUrl`.

## Adicionar produtos
Edite `config/products.js`, acrescente um ID único, nome, descrição e preço em MZN. Faça commit/push; Vercel fará deploy. Não crie uma variável de ambiente para cada produto. O backend ignora preços enviados pelo navegador.

## Importante
- O contrato documentado é `POST /v1/auth/token` e `POST /v1/orders` na API VPay.
- Confirme no primeiro teste o formato real da resposta da sua conta VPay; se a API não devolver um URL de checkout no pedido, o endpoint devolve `502` com a resposta VPay para diagnóstico, sem fabricar link.
- Configure webhooks assinados na VPay antes de entregar produtos digitais/activar encomendas. Nunca considere o redireccionamento de volta como prova de pagamento. A confirmação deve ser validada no servidor.
- Não coloque credenciais em HTML, JavaScript do site, GitHub ou screenshots.
