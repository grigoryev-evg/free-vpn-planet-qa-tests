import { expect, test } from '@playwright/test';
import { allowedPaymentHosts, paymentMethods } from '../../data/payment_methods';
import { isAllowedPaymentHost, normalizeText } from '../../utils/helpers';

test.describe('Payment API smoke', () => {
  test(
    'API_001 @api @smoke - Public funnel pages return non-5xx statuses',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      for (const url of [
        process.env.BASE_URL ?? 'https://freevpnplanet.com',
        process.env.PERSONAL_VPN_RU_URL ?? 'https://planetconfig.com',
        process.env.PERSONAL_VPN_EN_URL ?? 'https://personal.freevpnplanet.com',
      ]) {
        const response = await request.get(url);
        expect(response.status(), `${url} returned unexpected status`).toBeLessThan(500);
      }
    },
  );

  test(
    'API_002 @api - Allowed provider host list is normalized and non-empty',
    { tag: ['@api'] },
    async () => {
      const normalizedHosts = allowedPaymentHosts.map(normalizeText);
      const normalizedMethods = Object.values(paymentMethods).flat().map(normalizeText);

      expect(normalizedHosts.length).toBeGreaterThan(0);
      expect(new Set(normalizedHosts).size).toBe(normalizedHosts.length);
      expect(normalizedMethods).toContain('credit card');
      expect(isAllowedPaymentHost('https://checkout.stripe.com/c/pay')).toBe(true);
      expect(isAllowedPaymentHost('https://stripe.com/pay')).toBe(false);
      expect(isAllowedPaymentHost('https://evil-stripe.com/c/pay')).toBe(false);
    },
  );
});
