import { expect, test } from '@playwright/test';
import { allowedPaymentHosts, paymentMethods } from '../../data/payment_methods';
import { isAllowedPaymentHost, normalizeText } from '../../utils/helpers';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { SignupPage } from '../browser/pages/signup.page';
import { PlanSelectionPage } from '../browser/pages/plan_selection.page';

test.describe('Payment contract and network checks', () => {
  test('API_001 - Public funnel pages return non-5xx statuses', async ({ request }) => {
    for (const url of [
      process.env.BASE_URL ?? 'https://freevpnplanet.com',
      process.env.PERSONAL_VPN_RU_URL ?? 'https://planetconfig.com',
      process.env.PERSONAL_VPN_EN_URL ?? 'https://personal.freevpnplanet.com'
    ]) {
      const response = await request.get(url);
      expect(response.status(), `${url} returned unexpected status`).toBeLessThan(500);
    }
  });

  test('API_003 - Allowed provider host list is normalized and non-empty', async () => {
    const normalizedHosts = allowedPaymentHosts.map(normalizeText);
    const normalizedMethods = Object.values(paymentMethods).flat().map(normalizeText);

    expect(normalizedHosts.length).toBeGreaterThan(0);
    expect(new Set(normalizedHosts).size).toBe(normalizedHosts.length);
    expect(normalizedMethods).toContain('credit card');
    expect(isAllowedPaymentHost('https://checkout.stripe.com/c/pay')).toBe(true);
    expect(isAllowedPaymentHost('https://stripe.com/pay')).toBe(false);
    expect(isAllowedPaymentHost('https://evil-stripe.com/c/pay')).toBe(false);
  });

  test('API_004 - RU payment step exposes at least one expected payment control before submit', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredRuDefaults();
    await plan.continueToPaymentMethods();
    await payment.expectPaymentMethodsVisible();
  });
});
