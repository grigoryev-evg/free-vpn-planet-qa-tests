import { test } from '@playwright/test';
import { env } from '@config/env';
import { AccountPage } from '@pages/account.page';
import { HomePage } from '@pages/home.page';
import { createUniqueEmail } from '@utils/test-data-factory';

test.describe('Sign Up checkout', () => {
  test('opens sign up order page and displays payment methods', async ({ page }) => {
    const homePage = new HomePage(page);
    const accountPage = new AccountPage(page);
    const email = createUniqueEmail(env.signupEmailDomain);

    await homePage.open(env.baseUrl);
    await homePage.openLogin();
    await accountPage.expectLoaded();
    await accountPage.openSignUp();
    await accountPage.acceptCookiesIfPresent();
    await accountPage.fillEmail(email);
    await accountPage.goToPaymentStep();
    await accountPage.expectPaymentMethodsVisible();
  });
});
