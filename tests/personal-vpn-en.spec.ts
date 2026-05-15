import { test } from '@playwright/test';
import { env } from '@config/env';
import { DedicatedVpnPage } from '@pages/dedicated-vpn.page';
import { createUniqueEmail } from '@utils/test-data-factory';

const plans = ['1 month', '1 year'];
const paymentMethods = env.enPaymentMethods.slice(0, 2);

for (const plan of plans) {
  for (const paymentMethod of paymentMethods) {
    test(`EN personal VPN ${plan} redirects to checkout via ${paymentMethod}`, async ({ page }) => {
      if (plan === '1 year' && paymentMethod === 'cryptocurrency') {
        test.fail(true, 'Current EN yearly payment page does not expose the cryptocurrency option.');
      }

      const dedicatedVpnPage = new DedicatedVpnPage(page, 'en');
      const email = createUniqueEmail(env.signupEmailDomain);

      await dedicatedVpnPage.open(env.personalVpnEnUrl);
      await dedicatedVpnPage.chooseLocation('Netherlands');
      await dedicatedVpnPage.chooseCurrency('USD');
      await dedicatedVpnPage.choosePlan(plan);
      await dedicatedVpnPage.fillEmail(email);
      await dedicatedVpnPage.proceedToPaymentMethodSelection();
      await dedicatedVpnPage.expectPaymentMethodPage();
      await dedicatedVpnPage.expectPaymentMethodAvailable(paymentMethod);
    });
  }
}
