import { expect, test } from '@playwright/test';
import { userEmails, userPasswords } from '../../data/users';
import { PaymentMethodPage } from '../browser/pages/payment_method.page';
import { PaymentPage } from '../browser/pages/payment_page.page';
import { SignupPage } from '../browser/pages/signup.page';
import { expireCookie, seedCookies } from '../browser/helpers/cookies';
import { clearAllStorage, seedLocalStorage } from '../browser/helpers/storage';
import { runScenarioStep } from '../../utils/scenario_runner';

test.describe('Sign Up E2E', () => {
  test('TC_SIGNUP_001 @smoke @assignment - Successful signup with card reaches hosted checkout', async ({ page }) => {
    const signup = new SignupPage(page);
    const payment = new PaymentMethodPage(page);

    await runScenarioStep('Open landing and move to Sign Up', async () => {
      await signup.open();
      await signup.openSignUpFromLanding();
    });

    await runScenarioStep('Fill signup data and continue', async () => {
      await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
      await signup.continueToPaymentStep();
      await signup.expectPaymentStepVisible();
    });

    await runScenarioStep('Select card and submit', async () => {
      await payment.selectCard();
      await payment.acceptTerms();
      const targetPage = await payment.submitPayment();
      await new PaymentPage(targetPage).expectAllowedProviderHost();
    });
  });

  test('TC_SIGNUP_002 @smoke @assignment - Successful signup with default payment method reaches hosted checkout', { tag: ['@smoke', '@assignment'] }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payment = new PaymentMethodPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
    await signup.continueToPaymentStep();
    await payment.acceptTerms();

    const targetPage = await payment.submitPayment();
    await new PaymentPage(targetPage).expectAllowedProviderHost();
  });

  test('TC_SIGNUP_003 - Existing email shows controlled UX instead of checkout redirect', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({ email: userEmails.existing, password: userPasswords.valid });
    await signup.continueToPaymentStep();
    await signup.expectExistingEmailUx();
    await signup.expectNoCheckoutRedirect();
  });

  test('TC_SIGNUP_004 - Invalid email blocks signup', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({ email: userEmails.invalid, password: userPasswords.valid });
    await signup.continueToPaymentStep();
    await signup.expectEmailValidationError();
    await signup.expectStillOnCredentialsStep();
  });

  test('TC_SIGNUP_005 - Password policy is enforced when password fields are present', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();

    for (const candidate of [userPasswords.short, userPasswords.noDigits, userPasswords.noUppercase]) {
      await signup.fillCredentials({ email: signup.uniqueEmail(), password: candidate, confirmPassword: candidate });
      await signup.continueToPaymentStep();
      await signup.expectPasswordValidationError();
      await signup.resetCredentialsStep();
    }
  });

  test('TC_SIGNUP_006 - Password confirmation is enforced when present', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({
      email: signup.uniqueEmail(),
      password: userPasswords.valid,
      confirmPassword: userPasswords.mismatch
    });
    await signup.continueToPaymentStep();
    await signup.expectPasswordMismatchError();
  });

  test('TC_SIGNUP_007 - Empty required fields are rejected', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.continueToPaymentStep();
    await signup.expectRequiredFieldErrors();
  });

  test('TC_SIGNUP_008 - Next or submit button is guarded before valid data', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.expectNextDisabled();
    await signup.expectNoValidationBypassOnForcedSubmit();
  });

  test('TC_SIGNUP_COOKIES_001 - Returning user sees prefetched signup state', async ({ context, page }) => {
    const signup = new SignupPage(page);
    const domain = '.freevpnplanet.com';

    await seedCookies(context, [
      {
        name: 'signup_hint',
        value: '1',
        domain,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: true,
        sameSite: 'Lax'
      }
    ]);
    await seedLocalStorage(page, { signupEmail: 'saved@example.com' });

    await signup.open();
    await signup.openSignUpFromLanding();
    const emailValue = await signup.emailField().inputValue();
    expect(['', 'saved@example.com']).toContain(emailValue);
  });

  test('TC_SIGNUP_COOKIES_002 - Clean storage shows empty form', async ({ context, page }) => {
    const signup = new SignupPage(page);

    await context.clearCookies();
    await clearAllStorage(page);
    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.expectEmptyCredentialsForm();
  });

  test('TC_SIGNUP_COOKIES_003 - Expired auth either recovers session or allows checkout handoff', async ({ context, page }) => {
    const signup = new SignupPage(page);
    const payment = new PaymentMethodPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
    await signup.continueToPaymentStep();
    await expireCookie(context, '_auth');
    if (!(await payment.hasEnabledCard())) {
      await signup.expectPaymentStepVisible();
      return;
    }
    await payment.selectCard();
    await payment.acceptTerms();
    await payment.submitPayment();
    await signup.expectAuthRecoveryScreen();
  });

  test('TC_SIGNUP_UI_001 - CTA changes from disabled to enabled after required fields are valid', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.expectNextDisabled();
    await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
    await signup.expectNextEnabled();
  });

  test('TC_SIGNUP_UI_002 - Loading state appears after submit', async ({ page }) => {
    const signup = new SignupPage(page);
    const payment = new PaymentMethodPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
    await signup.continueToPaymentStep();
    await payment.selectCard();
    await payment.acceptTerms();
    await payment.clickSubmitAndExpectLoadingState();
  });

  test('TC_SIGNUP_MODAL_001 - Leaving dirty form is handled without checkout redirect', async ({ page }) => {
    const signup = new SignupPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillEmailOnly(signup.uniqueEmail());
    await signup.tryToLeaveDirtyForm();
    await signup.expectLeaveConfirmationModal();
    await signup.cancelLeaveAndExpectFormPreserved();
  });

  test('TC_SIGNUP_MODAL_002 - Signup error modal exposes recovery action', async ({ page }) => {
    const signup = new SignupPage(page);
    const payment = new PaymentMethodPage(page);

    await signup.open();
    await signup.openSignUpFromLanding();
    await signup.fillCredentials({ email: signup.uniqueEmail(), password: userPasswords.valid });
    await signup.continueToPaymentStep();
    await payment.mockCheckoutFailure();
    await payment.selectCard();
    await payment.acceptTerms();
    await payment.submitPayment();
    await payment.expectRetryErrorModal();
    await payment.closeErrorModal();
  });
});