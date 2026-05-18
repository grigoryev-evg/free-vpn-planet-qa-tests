import { expect, test } from '@playwright/test';
import { cryptoCurrencies, type CryptoCurrency } from '../../data/payment_methods';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { PlanSelectionPage } from '../browser/pages/plan_selection.page';

type Currency = 'RUB' | 'USD' | 'EUR';
type PlanCode = 'monthly' | 'yearly' | '2_days';

async function preparePlanetConfig(page: import('@playwright/test').Page, options: { currency: Currency; plan: PlanCode }) {
  const plan = new PlanSelectionPage(page, 'ru');
  await plan.fillRequiredDefaults({ locale: 'ru', currency: options.currency, plan: options.plan });
  await plan.continueToPaymentMethods();
  await plan.expectPaymentMethodStepVisible();
}

test.describe('PlanetConfig checkout matrix', () => {
  test('TC_PLANETCONFIG_BOT_001 @assignment @smoke — Buy via bot opens Telegram', { tag: ['@assignment', '@smoke'] }, async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    await plan.openRu();

    const popupPromise = page.context().waitForEvent('page', { timeout: 15_000 }).catch(() => null);
    await plan.clickBotButton();
    const target = (await popupPromise) ?? page;
    await target.waitForLoadState('domcontentloaded').catch(() => null);

    await expect
      .poll(async () => target.url(), { message: 'Expected Telegram bot link to open' })
      .toMatch(/https?:\/\/(t\.me|telegram\.me|web\.telegram\.org)\//i);
  });

  const rubMethods = [
    { id: 'RF_BANK_CARD', method: 'rf_bank_card' as const, host: 'yoomoney.ru' },
    { id: 'SBP', method: 'sbp' as const, host: 'qr.nspk.ru' },
    { id: 'SBERPAY', method: 'sberpay' as const, host: 'yoomoney.ru' },
    { id: 'YOOMONEY', method: 'yoomoney' as const, host: 'yoomoney.ru' },
  ] as const;

  for (const variant of rubMethods) {
    test(`TC_PLANETCONFIG_RUB_${variant.id} @assignment — RUB 2 days → ${variant.host}`, { tag: ['@assignment'] }, async ({ page }) => {
      const payment = new PaymentMethodPage(page);

      await preparePlanetConfig(page, { currency: 'RUB', plan: '2_days' });
      await payment.selectPaymentMethod(variant.method);
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      await new PaymentPage(targetPage).expectHost(variant.host);
    });
  }

  test('TC_PLANETCONFIG_RUB_2_DAYS_CREDIT_CARD @assignment — RUB 2 days Credit Card → Stripe + Link', { tag: ['@assignment'] }, async ({ page }) => {
    const payment = new PaymentMethodPage(page);

    await preparePlanetConfig(page, { currency: 'RUB', plan: '2_days' });
    await payment.selectCard();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    const checkout = new PaymentPage(targetPage);
    await checkout.expectStripeCheckout();
    const linkUrl = await checkout.clickLinkAndExpectLinkCheckout();
    test.info().annotations.push({ type: 'link_checkout', description: linkUrl });
  });

  for (const currency of ['RUB', 'USD', 'EUR'] as const) {
    test(`TC_PLANETCONFIG_${currency}_CARD @assignment @smoke — ${currency} monthly Credit Card → Stripe + Link`, { tag: ['@assignment', '@smoke'] }, async ({ page }) => {
      const payment = new PaymentMethodPage(page);

      await preparePlanetConfig(page, { currency, plan: 'monthly' });
      await payment.selectCard();
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      const checkout = new PaymentPage(targetPage);
      await checkout.expectStripeCheckout();
      const linkUrl = await checkout.clickLinkAndExpectLinkCheckout();
      test.info().annotations.push({ type: 'link_checkout', description: linkUrl });
    });
  }

  for (const currency of ['RUB', 'USD', 'EUR'] as const) {
    for (const plan of ['monthly', 'yearly'] as const) {
      test(`TC_PLANETCONFIG_${currency}_${plan.toUpperCase()}_CRYPTO_BTC @assignment — ${currency} ${plan} Bitcoin → CoinPayments`, { tag: ['@assignment'] }, async ({ page }) => {
        const payment = new PaymentMethodPage(page);

        await preparePlanetConfig(page, { currency, plan });
        await payment.selectCrypto();
        const bitcoin: CryptoCurrency = { name: 'Bitcoin', code: 'BTC', network: 'btc' };
        await payment.selectCryptoCurrency(bitcoin.name, bitcoin.code);
        await payment.acceptTerms();

        const targetPage = await payment.submitPayment();
        const checkout = new PaymentPage(targetPage);
        await checkout.expectCoinPaymentsCheckout();
        await checkout.expectWalletAddressOrQr();
        await checkout.expectCoinPaymentsCurrency(bitcoin);
      });
    }
  }

  for (const currency of cryptoCurrencies) {
    test(`TC_PLANETCONFIG_CRYPTO_NETWORK_${currency.code} @assignment — RUB monthly ${currency.name} → CoinPayments`, { tag: ['@assignment'] }, async ({ page }) => {
      const payment = new PaymentMethodPage(page);

      await preparePlanetConfig(page, { currency: 'RUB', plan: 'monthly' });
      await payment.selectCrypto();
      await payment.selectCryptoCurrency(currency.name, currency.code);
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      const checkout = new PaymentPage(targetPage);
      await checkout.expectCoinPaymentsCheckout();
      await checkout.expectWalletAddressOrQr();
      await checkout.expectCoinPaymentsCurrency(currency);
    });
  }
});
