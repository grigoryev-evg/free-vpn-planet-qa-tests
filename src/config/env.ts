import 'dotenv/config';

const parseList = (value: string | undefined, fallback: string[]): string[] =>
  (value ?? fallback.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://freevpnplanet.com',
  accountUrl: process.env.ACCOUNT_URL ?? 'https://account.freevpnplanet.com',
  personalVpnRuUrl: process.env.PERSONAL_VPN_RU_URL ?? 'https://planetconfig.com',
  personalVpnEnUrl: process.env.PERSONAL_VPN_EN_URL ?? 'https://personal.freevpnplanet.com',
  signupPassword: process.env.SIGNUP_PASSWORD ?? 'PlanetVpnE2E!2026',
  signupEmailDomain: process.env.SIGNUP_EMAIL_DOMAIN ?? 'example.com',
  signupPaymentMethod: process.env.SIGNUP_PAYMENT_METHOD ?? 'card',
  ruPaymentMethods: parseList(process.env.RU_PAYMENT_METHODS, ['bank card', 'cryptocurrency']),
  enPaymentMethods: parseList(process.env.EN_PAYMENT_METHODS, ['bank card', 'cryptocurrency'])
} as const;
