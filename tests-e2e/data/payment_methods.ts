export const paymentMethods = {
  card: ['card', 'bank card', 'credit card', 'карты банков рф', 'банковская карта'],
  sbp: ['sbp', 'система быстрых платежей', 'быстрые платежи'],
  sberpay: ['sberpay', 'sber pay', 'сберпей'],
  yoomoney: ['yoomoney', 'юmoney', 'ю money'],
  crypto: ['cryptocurrency', 'crypto', 'bitcoin', 'btc', 'криптовалюта'],
} as const;

export const allowedPaymentHosts = [
  'checkout.stripe.com',
  'checkout.link.com',
  'www.coinpayments.net',
  'paymentt.kassa.ai',
  'yoomoney.ru',
  'www.paypal.com',
  'qr.nspk.ru',
] as const;

export type CryptoCurrency = {
  name: string;
  code: string;
  network?: 'btc' | 'lightning' | 'bch' | 'ltc' | 'erc20' | 'trc20' | 'solana';
};

export const cryptoCurrencies: readonly CryptoCurrency[] = [
  { name: 'Bitcoin', code: 'BTC', network: 'btc' },
  { name: 'Bitcoin (Lightning Network)', code: 'BTC_LN', network: 'lightning' },
  { name: 'Bitcoin Cash', code: 'BCH', network: 'bch' },
  { name: 'Litecoin', code: 'LTC', network: 'ltc' },
  { name: 'Dai (ERC20)', code: 'DAI', network: 'erc20' },
  { name: 'Dash', code: 'DASH' },
  { name: 'Dogecoin', code: 'DOGE' },
  { name: 'Ether Classic', code: 'ETC' },
  { name: 'SHIBA INU (ERC20)', code: 'SHIB', network: 'erc20' },
  { name: 'Solana', code: 'SOL' },
  { name: 'TRON', code: 'TRX' },
  { name: 'TrueUSD', code: 'TUSD' },
  { name: 'TrueUSD (Tron/TRC20)', code: 'TUSD_TRC20', network: 'trc20' },
  { name: 'USD Coin (ERC20)', code: 'USDC', network: 'erc20' },
  { name: 'Tether USD (ERC20)', code: 'USDT_ERC20', network: 'erc20' },
  { name: 'Tether USD (Solana)', code: 'USDT_SOL', network: 'solana' },
  { name: 'Tether USD (Tron/TRC20)', code: 'USDT_TRC20', network: 'trc20' },
  { name: 'Monero', code: 'XMR' },
] as const;

export const isPayableCurrency = (currency: CryptoCurrency): boolean => {
  // Litecoin is known to have UI issues but is still a payable currency
  // We include all currencies here; test stability is handled at the test level
  return true;
};

export const isNetworkedCurrency = (currency: CryptoCurrency): boolean => {
  return currency.network !== undefined;
};

export type PaymentMethod = 'card' | 'credit_card' | 'crypto' | 'sbp' | 'sberpay' | 'yoomoney' | 'rf_bank_card';

export const checkoutLinkHost = 'checkout.link.com';
