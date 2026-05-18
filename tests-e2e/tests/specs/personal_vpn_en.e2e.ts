import { test } from '@playwright/test';
import { type CryptoCurrency } from '../../data/payment_methods';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { PlanSelectionPage } from '../browser/pages/plan_selection.page';

type Currency = 'RUB' | 'EUR';
type PlanCode = 'monthly' | 'yearly';

async function preparePersonalVpn(page: import('@playwright/test').Page, options: { currency: Currency; plan: PlanCode }) {
  const plan = new PlanSelectionPage(page, 'en');
  await plan.fillRequiredDefaults({ locale: 'en', currency: options.currency, plan: options.plan });
  await plan.continueToPaymentMethods();
  await plan.expectPaymentMethodStepVisible();
}

test.describe('Personal FreeVPNPlanet checkout matrix', () => {
  test('TC_PERSONAL_RUB_SBP @assignment @smoke — RUB monthly SBP → kassa.ai', { tag: ['@assignment', '@smoke'] }, async ({ page }) => {
    const payment = new PaymentMethodPage(page);

    await preparePersonalVpn(page, { currency: 'RUB', plan: 'monthly' });
    await payment.selectSbp();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectHost('paymentt.kassa.ai');
  });

  for (const currency of ['RUB', 'EUR'] as const) {
    test(`TC_PERSONAL_${currency}_CARD @assignment @smoke — ${currency} monthly Credit Card → Stripe`, { tag: ['@assignment', '@smoke'] }, async ({ page }) => {
      const payment = new PaymentMethodPage(page);

      await preparePersonalVpn(page, { currency, plan: 'monthly' });
      await payment.selectCard();
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      await new PaymentPage(targetPage).expectStripeCheckout();
    });
  }

  for (const currency of ['RUB', 'EUR'] as const) {
    test(`TC_PERSONAL_${currency}_MONTHLY_CRYPTO_BTC @assignment — ${currency} monthly Bitcoin → CoinPayments`, { tag: ['@assignment'] }, async ({ page }) => {
      const payment = new PaymentMethodPage(page);
      const bitcoin: CryptoCurrency = { name: 'Bitcoin', code: 'BTC', network: 'btc' };

      await preparePersonalVpn(page, { currency, plan: 'monthly' });
      await payment.selectCrypto();
      await payment.selectCryptoCurrency(bitcoin.name, bitcoin.code);
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      const checkout = new PaymentPage(targetPage);
      await checkout.expectCoinPaymentsCheckout();
      await checkout.expectWalletAddressOrQr();
      await checkout.expectCoinPaymentsCurrency(bitcoin);
    });
  }
});
