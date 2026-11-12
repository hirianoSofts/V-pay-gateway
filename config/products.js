// Catálogo central: os preços ficam no BACKEND, nunca no navegador.
// Para adicionar produtos, acrescente outro objeto. Não precisa criar variáveis Vercel.
export const PRODUCTS = {
  'headphones-demo': {
    name: 'Auscultadores Studio',
    description: 'Auscultadores de demonstração',
    price: 850,
    currency: 'MZN',
    originProductId: 'headphones-demo'
  },
  'curso-demo': {
    name: 'Curso de Demonstração',
    description: 'Acesso ao curso de demonstração',
    price: 1200,
    currency: 'MZN',
    originProductId: 'curso-demo'
  }
};
