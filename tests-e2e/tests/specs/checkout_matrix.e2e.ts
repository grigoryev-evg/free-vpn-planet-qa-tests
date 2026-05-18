import { test } from '@playwright/test';
import { SignupPage } from '../browser/pages/signup.page';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { cryptoCurrencies, isPayableCurrency } from '../../data/payment_methods';
import { userPasswords } from '../../data/users';

test.describe('FreeVPNPlanet signup checkout matrix', () => {
  test.describe.configure({ mode: 'default' });

  test(
    'TC_FVPN_SIGNUP_CARD_001 @assignment @smoke — Credit Card → Stripe + Link',
    { tag: ['@assignment', '@smoke'] },
    async ({ page }) => {
      const signup = new SignupPage(page);
      const payment = new PaymentMethodPage(page);

      await signup.open();
      await signup.openSignUpFromLanding();
      await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
      await signup.continueToPaymentStep();
      await signup.expectPaymentStepVisible();

      await payment.selectCard();
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      const paymentPage = new PaymentPage(targetPage);

      await paymentPage.expectStripeCheckout();
      const linkUrl = await paymentPage.clickLinkAndExpectLinkCheckout();
      test.info().annotations.push({ type: 'link_checkout', description: linkUrl });
    },
  );

  const currencies = cryptoCurrencies.filter((c) => isPayableCurrency(c));

  for (const currency of currencies) {
    test(`TC_FVPN_SIGNUP_CRYPTO_${currency.code} @assignment — ${currency.name} → CoinPayments`, { tag: ['@assignment'] }, async ({ page }) => {
      const signup = new SignupPage(page);
      const payment = new PaymentMethodPage(page);

      await signup.open();
      await signup.openSignUpFromLanding();
      await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
      await signup.continueToPaymentStep();
      await signup.expectPaymentStepVisible();

      await payment.selectCrypto();
      await payment.selectCryptoCurrency(currency.name, currency.code);
      await payment.acceptTerms();

      const targetPage = await payment.submitPayment();
      const paymentPage = new PaymentPage(targetPage);

      await paymentPage.expectCoinPaymentsCheckout();
      await paymentPage.expectWalletAddressOrQr();
      await paymentPage.expectCoinPaymentsCurrency(currency);
    });
  }
});
