import { test } from '@playwright/test';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { PlanSelectionPage } from '../browser/pages/plan_selection.page';
import { seedCookies } from '../browser/helpers/cookies';
import { clearAllStorage, seedLocalStorage } from '../browser/helpers/storage';

test.describe('Personal VPN EN E2E', () => {
  test('TC_VPN_EN_001 @smoke - Monthly plan with card reaches hosted checkout', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredEnDefaults({ plan: '1 month' });
    await plan.continueToPaymentMethods();
    await plan.expectPaymentMethodStepVisible();
    await payment.selectEnBankCard();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_EN_002 @smoke - Annual plan with card reaches hosted checkout', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredEnDefaults({ plan: '1 year' });
    await plan.continueToPaymentMethods();
    await payment.selectEnBankCard();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_EN_003 - Monthly plan with PayPal reaches provider page when available', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredEnDefaults({ plan: '1 month' });
    await plan.continueToPaymentMethods();
    await payment.selectPayPal();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_EN_004 - Annual plan with PayPal reaches provider page when available', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredEnDefaults({ plan: '1 year' });
    await plan.continueToPaymentMethods();
    await payment.selectPayPal();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_EN_COOKIES_001 - Previous plan state is restored when cookies exist', async ({ context, page }) => {
    const plan = new PlanSelectionPage(page, 'en');

    await seedCookies(context, [
      {
        name: 'last_plan',
        value: 'month',
        domain: '.personal.freevpnplanet.com',
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      }
    ]);
    await seedLocalStorage(page, { vpnEnCurrency: 'USD', vpnEnPlan: '1 month' });
    await plan.openEn();
    await plan.expectSelectedCurrency('USD');
  });

  test('TC_VPN_EN_COOKIES_002 - Clean context shows fresh EN state', async ({ context, page }) => {
    const plan = new PlanSelectionPage(page, 'en');

    await context.clearCookies();
    await clearAllStorage(page);
    await plan.openEn();
    await plan.expectDefaultEnState();
  });

  test('TC_VPN_EN_UI_001 - Currency switch updates EN UI summary', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');

    await plan.openEn();
    const initial = await plan.captureCurrentSummary();
    await plan.switchCurrency('USD');
    await plan.expectCurrency('USD');
    await plan.expectSummaryChanged(initial);
  });

  test('TC_VPN_EN_UI_002 - Pay action shows loading state', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredEnDefaults({ plan: '1 month' });
    await plan.continueToPaymentMethods();
    await payment.selectEnBankCard();
    await payment.acceptTerms();
    await payment.clickSubmitAndExpectLoadingState();
  });

  test('TC_VPN_EN_MODAL_001 - Tooltip or helper is visible for supported input controls', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'en');

    await plan.openEn();
    await plan.focusEmailFieldHelpIcon();
    await plan.expectEmailTooltipVisible();
    await plan.dismissEmailTooltip();
    await plan.expectEmailTooltipHidden();
  });
});
