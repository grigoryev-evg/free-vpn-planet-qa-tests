import { test } from '@playwright/test';
import { env } from '@config/env';
import { dedicatedVpnDefaults } from '@config/test-data';
import { DedicatedVpnPage } from '@pages/dedicated-vpn.page';
import { createUniqueEmail } from '@utils/test-data-factory';

for (const paymentMethod of env.ruPaymentMethods) {
  test(`RU personal VPN purchase redirects to checkout via ${paymentMethod}`, async ({ page }) => {
    const dedicatedVpnPage = new DedicatedVpnPage(page, 'ru');
    const email = createUniqueEmail(env.signupEmailDomain);

    await dedicatedVpnPage.open(env.personalVpnRuUrl);
    await dedicatedVpnPage.chooseLocation(dedicatedVpnDefaults.ru.location);
    await dedicatedVpnPage.chooseCurrency(dedicatedVpnDefaults.ru.currency);
    await dedicatedVpnPage.choosePlan(dedicatedVpnDefaults.ru.plan);
    await dedicatedVpnPage.fillEmail(email);
    await dedicatedVpnPage.proceedToPaymentMethodSelection();
    await dedicatedVpnPage.expectPaymentMethodPage();
    await dedicatedVpnPage.expectPaymentMethodAvailable(paymentMethod);
  });
}
