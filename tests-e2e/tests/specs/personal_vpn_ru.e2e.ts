import { test } from '@playwright/test';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { PlanSelectionPage } from '../browser/pages/plan_selection.page';
import { seedCookies } from '../browser/helpers/cookies';
import { clearAllStorage, seedLocalStorage } from '../browser/helpers/storage';
import { runScenarioStep } from '../../utils/scenario_runner';

test.describe('Personal VPN RU E2E', () => {
  test('TC_VPN_RU_001 @smoke - Monthly plan with card reaches hosted checkout', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await runScenarioStep('Open RU product and fill defaults', async () => {
      await plan.fillRequiredRuDefaults();
      await plan.continueToPaymentMethods();
      await plan.expectPaymentMethodStepVisible();
    });

    await runScenarioStep('Choose bank card and submit', async () => {
      await payment.selectRuBankCard();
      await payment.acceptTerms();
      const targetPage = await payment.submitPayment();
      await new PaymentPage(targetPage).expectAllowedProviderHost();
    });
  });

  test('TC_VPN_RU_002 - Annual plan with card reaches hosted checkout', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.openRu();
    await plan.selectLocation('Netherlands');
    await plan.selectCurrency('RUB');
    await plan.selectYearlyPlan();
    await plan.fillEmail(plan.uniqueEmail());
    await plan.continueToPaymentMethods();
    await payment.selectRuBankCard();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_RU_003 @smoke - Monthly plan with cryptocurrency reaches hosted checkout', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredRuDefaults();
    await plan.continueToPaymentMethods();
    await payment.selectRuCrypto('BTC');
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_RU_004 - Annual plan with cryptocurrency reaches hosted checkout', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.openRu();
    await plan.selectLocation('Netherlands');
    await plan.selectCurrency('RUB');
    await plan.selectYearlyPlan();
    await plan.fillEmail(plan.uniqueEmail());
    await plan.continueToPaymentMethods();
    await payment.selectRuCrypto('BTC');
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_VPN_RU_005 - Back or cancel returns to plan selection without breaking state', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredRuDefaults();
    await plan.continueToPaymentMethods();
    await payment.goBackFromPaymentStep();
    await plan.expectPlanSelectionStepVisible();
    await plan.expectSelectionsPreserved();
  });

  test('TC_VPN_RU_006 - Failed payment route shows controlled failure state', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredRuDefaults();
    await plan.continueToPaymentMethods();
    await payment.mockDeclinedPayment();
    await payment.selectRuBankCard();
    await payment.acceptTerms();
    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectFailedPaymentState();
  });

  test('TC_VPN_RU_007 - Plan can be changed from payment step with confirmation flow', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredRuDefaults();
    await plan.continueToPaymentMethods();
    await payment.triggerChangePlan();
    await payment.expectConfirmDialog();
    await payment.cancelPlanChangeAndStayOnPayment();
    await payment.triggerChangePlan();
    await payment.confirmPlanChangeAndReturnToPlanStep();
    await plan.expectPlanSelectionStepVisible();
  });

  test('TC_VPN_RU_COOKIES_001 - Cookies restore last plan and currency when supported', async ({ context, page }) => {
    const plan = new PlanSelectionPage(page, 'ru');

    await seedCookies(context, [
      {
        name: 'last_plan',
        value: 'year',
        domain: '.planetconfig.com',
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      }
    ]);
    await seedLocalStorage(page, { vpnRuCurrency: 'RUB', vpnRuLocation: 'Netherlands' });
    await plan.openRu();
    await plan.expectSelectedCurrency('RUB');
  });

  test('TC_VPN_RU_COOKIES_002 - Clean context starts from reset RU UI', async ({ context, page }) => {
    const plan = new PlanSelectionPage(page, 'ru');

    await context.clearCookies();
    await clearAllStorage(page);
    await plan.openRu();
    await plan.expectDefaultRuState();
  });

  test('TC_VPN_RU_COOKIES_003 - Flow remains usable with localStorage only', async ({ context, page }) => {
    const plan = new PlanSelectionPage(page, 'ru');

    await context.clearCookies();
    await seedLocalStorage(page, { vpnRuLocation: 'Netherlands' });
    await plan.openRu();
    await plan.expectFlowUsableWithLocalStorageOnly();
  });

  test('TC_VPN_RU_UI_001 - Plan switch changes active state and summary', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');

    await plan.openRu();
    const initial = await plan.captureCurrentSummary();
    await plan.selectYearlyPlan();
    await plan.expectSummaryChanged(initial);
  });

  test('TC_VPN_RU_UI_002 - Wizard prevents direct payment access before required fields', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');

    await plan.openRu();
    await plan.expectWizardStepActive('configuration');
    await plan.expectCannotOpenPaymentStepDirectly();
  });

  test('TC_VPN_RU_MODAL_001 - Changing plan on payment page requires confirmation', async ({ page }) => {
    const plan = new PlanSelectionPage(page, 'ru');
    const payment = new PaymentMethodPage(page);

    await plan.fillRequiredRuDefaults();
    await plan.continueToPaymentMethods();
    await payment.triggerChangePlan();
    await payment.expectConfirmDialog();
    await payment.cancelPlanChangeAndStayOnPayment();
  });
});
