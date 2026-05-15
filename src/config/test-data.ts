export type DedicatedVpnScenario = {
  name: string;
  url: string;
  locale: 'ru' | 'en';
  location: string;
  currency: string;
  plan: string;
  paymentMethod: string;
};

export const dedicatedVpnDefaults = {
  ru: {
    location: 'Netherlands',
    currency: 'RUB',
    plan: '1 месяц'
  },
  en: {
    location: 'Netherlands',
    currency: 'USD',
    plan: '1 month'
  }
} as const;

