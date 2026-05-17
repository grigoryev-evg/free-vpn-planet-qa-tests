import { test } from '@playwright/test';
import { PlanSelectionPage } from '../browser/pages/plan_selection.page';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';

/**
 * Assignment test suite — минимальный набор позитивных e2e сценариев
 * для тестового задания.
 *
 * Покрывает:
 *   1. Sign Up (ru) + card → hosted checkout
 *   2. Personal VPN RU + monthly + card → hosted checkout
 *   3. Personal VPN RU + monthly + crypto → hosted checkout
 *   4. Personal VPN EN + monthly + card → hosted checkout
 *   5. Personal VPN EN + monthly + crypto → hosted checkout
 *   6. Personal VPN RU + yearly + card → hosted checkout
 *   7. Personal VPN EN + yearly + card → hosted checkout
 */

const variants = [
  // Sign Up
  { context: 'signup', locale: 'ru' as const, plan: 'monthly' as const, payment: 'card' as const, isSignup: true, tag: '@assignment @smoke' },

  // Personal VPN RU
  { context: 'vpn_ru', locale: 'ru' as const, plan: 'monthly' as const, payment: 'card' as const, isSignup: false, tag: '@assignment @smoke' },
  { context: 'vpn_ru', locale: 'ru' as const, plan: 'monthly' as const, payment: 'crypto' as const, isSignup: false, tag: '@assignment @smoke' },
  { context: 'vpn_ru', locale: 'ru' as const, plan: 'yearly' as const, payment: 'card' as const, isSignup: false, tag: '@assignment' },

  // Personal VPN EN
  { context: 'vpn_en', locale: 'en' as const, plan: 'monthly' as const, payment: 'card' as const, isSignup: false, tag: '@assignment @smoke' },
  { context: 'vpn_en', locale: 'en' as const, plan: 'monthly' as const, payment: 'crypto' as const, isSignup: false, tag: '@assignment' },
  { context: 'vpn_en', locale: 'en' as const, plan: 'yearly' as const, payment: 'card' as const, isSignup: false, tag: '@assignment' },
] as const;

test.describe('Assignment — позитивные e2e сценарии', () => {
  for (const v of variants) {
    const testId = `TC_ASSIGN_${v.context.toUpperCase()}_${v.plan}_${v.payment}`;
    const title = `${testId} — ${v.context} ${v.plan} + ${v.payment} → hosted checkout ${v.tag}`;

    test(title, { tag: [v.tag] }, async ({ page }) => {
      const plan = new PlanSelectionPage(page, v.locale);
      const paymentMethod = new PaymentMethodPage(page);

      await test.step('Заполнить обязательные поля', async () => {
        if (v.isSignup) {
          await plan.fillRequiredDefaults({ locale: v.locale });
        } else {
          await plan.fillRequiredDefaults({ locale: v.locale, plan: v.plan });
        }
      });

      await test.step('Перейти к способам оплаты', () => plan.continueToPaymentMethods());

      await test.step(`Выбрать ${v.payment} и подтвердить`, async () => {
        await paymentMethod.selectPaymentMethod(v.payment);
        await paymentMethod.acceptTerms();
      });

      await test.step('Отправить и проверить редирект', async () => {
        const targetPage = await paymentMethod.submitPayment();
        await new PaymentPage(targetPage).expectAllowedProviderHost();
      });
    });
  }
});