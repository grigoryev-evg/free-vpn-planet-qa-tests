import { test } from '@playwright/test';
import { AccountPage } from '@pages/account.page';
import { dedicatedVpnDefaults } from '@config/test-data';
import { DedicatedVpnPage } from '@pages/dedicated-vpn.page';
import { HomePage } from '@pages/home.page';

test.describe('Known checkout issues', () => {
  test('sign up submit should reach hosted checkout', async ({ page }) => {
    test.fail(true, 'Current production checkout does not proceed from account order page after Get your subscription.');

    const homePage = new HomePage(page);
    const accountPage = new AccountPage(page);

    await homePage.open('https://freevpnplanet.com');
    await homePage.openLogin();
    await accountPage.openSignUp();
    await accountPage.acceptCookiesIfPresent();
    await accountPage.fillEmail('qa@example.com');
    await accountPage.goToPaymentStep();
    await accountPage.choosePaymentMethod('card');
    await accountPage.acceptTerms();
    const checkoutPage = await accountPage.submitSubscription();
    await accountPage.expectHostedCheckout(checkoutPage);
  });

  test('EN dedicated VPN card submit should reach hosted checkout', async ({ page }) => {
    test.fail(true, 'Current production payment page opens but does not proceed to hosted checkout after Pay for the 1 month EN flow.');

    const dedicatedVpnPage = new DedicatedVpnPage(page, 'en');

    await dedicatedVpnPage.open('https://personal.freevpnplanet.com');
    await dedicatedVpnPage.chooseLocation(dedicatedVpnDefaults.en.location);
    await dedicatedVpnPage.chooseCurrency(dedicatedVpnDefaults.en.currency);
    await dedicatedVpnPage.choosePlan('1 month');
    await dedicatedVpnPage.fillEmail('qa@example.com');
    await dedicatedVpnPage.proceedToPaymentMethodSelection();
    await dedicatedVpnPage.expectPaymentMethodPage();
    await dedicatedVpnPage.choosePaymentMethod('bank card');
    await dedicatedVpnPage.acceptTerms();
    const checkoutPage = await dedicatedVpnPage.submitPayment();
    await dedicatedVpnPage.expectCheckoutPageOpened(checkoutPage);
  });

  test('RU dedicated VPN card submit should reach hosted checkout', async ({ page }) => {
    test.fail(true, 'Current production payment page opens but does not proceed to hosted checkout after Оплатить for the 1 month RU flow.');

    const dedicatedVpnPage = new DedicatedVpnPage(page, 'ru');

    await dedicatedVpnPage.open('https://planetconfig.com');
    await dedicatedVpnPage.chooseLocation(dedicatedVpnDefaults.ru.location);
    await dedicatedVpnPage.chooseCurrency(dedicatedVpnDefaults.ru.currency);
    await dedicatedVpnPage.choosePlan('1 месяц');
    await dedicatedVpnPage.fillEmail('qa@example.com');
    await dedicatedVpnPage.proceedToPaymentMethodSelection();
    await dedicatedVpnPage.expectPaymentMethodPage();
    await dedicatedVpnPage.choosePaymentMethod('bank card');
    await page.locator('label.ppg__label.checkbox').click({ force: true });
    const checkoutPage = await dedicatedVpnPage.submitPayment();
    await dedicatedVpnPage.expectCheckoutPageOpened(checkoutPage);
  });
});
