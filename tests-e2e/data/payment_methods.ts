export const paymentMethods = {
  card: ['card', 'bank card', 'credit card'],
  crypto: ['cryptocurrency', 'crypto', 'bitcoin', 'btc'],
  paypal: ['paypal', 'pay pal']
} as const;

export const allowedPaymentHosts = [
  'checkout.stripe.com',
  'www.coinpayments.net',
  'paymentt.kassa.ai',
  'yoomoney.ru',
  'www.paypal.com'
] as const;
