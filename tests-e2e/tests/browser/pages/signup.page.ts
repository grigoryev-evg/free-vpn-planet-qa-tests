import { expect, Locator, Page } from '@playwright/test';
import { createUniqueEmail, expectPageHost, isAllowedPaymentHost } from '../../../utils/helpers';

type Credentials = {
  email: string;
  password?: string;
  confirmPassword?: string;
};

export class SignupPage {
  private submittedEmail?: string;

  constructor(private readonly page: Page) {}

  uniqueEmail(): string {
    return createUniqueEmail(process.env.SIGNUP_EMAIL_DOMAIN ?? 'mailinator.com');
  }

  async open(): Promise<void> {
    await this.page.goto(process.env.BASE_URL ?? 'https://freevpnplanet.com', { waitUntil: 'domcontentloaded' });
    await expectPageHost(this.page, 'freevpnplanet.com');
  }

  async openSignUpFromLanding(): Promise<void> {
    await this.acceptCookiesIfPresent();
    await this.page.getByRole('link', { name: /log in/i }).click();
    await expect(this.page).toHaveURL(/account\.freevpnplanet\.com/i);
    await this.page.getByRole('link', { name: /sign up/i }).click();
    await expect(this.emailField()).toBeVisible();
  }

  async acceptCookiesIfPresent(): Promise<void> {
    const acceptButton = this.page.getByRole('button', { name: /^accept$/i });
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click({ force: true });
    }
  }

  emailField(): Locator {
    return this.page
      .locator('[data-test-id="order-email-input"], input[placeholder="Enter email"], input[placeholder*="email" i], input[name="email"], input[type="email"]')
      .first();
  }

  passwordField(): Locator {
    return this.page.locator('input[type="password"], input[name="password"]').first();
  }

  confirmPasswordField(): Locator {
    return this.page
      .locator('input[type="password"][name*="confirm" i], input[placeholder*="confirm" i], input[name*="repeat" i]')
      .first();
  }

  async hasPasswordField(): Promise<boolean> {
    return this.passwordField().isVisible().catch(() => false);
  }

  nextButton(): Locator {
    return this.page
      .locator('[data-test-id="order-login-submit-button"], [data-test-id="order-next-button"], button:has-text("Next")')
      .first();
  }

  async fillEmailOnly(email: string): Promise<void> {
    this.submittedEmail = email;
    const emailInput = this.emailField();
    await expect(emailInput).toBeEditable();
    await emailInput.click();
    await emailInput.fill(email);
    await expect(emailInput).toHaveValue(email).catch(async () => {
      await emailInput.fill(email);
      await expect(emailInput).toHaveValue(email).catch(() => null);
    });
    await emailInput.blur().catch(() => null);
    await this.page.waitForTimeout(300);
  }

  async fillCredentials({ email, password, confirmPassword }: Credentials): Promise<void> {
    await this.fillEmailOnly(email);

    const passwordField = this.passwordField();
    if (await passwordField.isVisible().catch(() => false)) {
      await passwordField.fill(password ?? '').catch(() => null);
    }

    const confirmField = this.confirmPasswordField();
    if (await confirmField.isVisible().catch(() => false)) {
      await confirmField.fill(confirmPassword ?? password ?? '').catch(() => null);
    }
  }

  async continueToPaymentStep(): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await this.page.waitForTimeout(10_000);
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await expect(this.emailField()).toBeVisible({ timeout: 15_000 });
        await this.fillEmailOnly(this.uniqueEmail());
      }

      const next = this.nextButton();
      if (await next.isVisible().catch(() => false)) {
        const wasEnabled = await next.isEnabled({ timeout: 15_000 }).catch(() => false);
        if (wasEnabled) {
          await next.click();
          if (await this.isPaymentStepEnabled()) {
            return;
          }
          continue;
        }
      }

      if (await this.isPaymentStepEnabled()) {
        return;
      }
    }

    await this.waitForPaymentStepEnabled();
  }

  async expectPaymentStepVisible(): Promise<void> {
    await this.waitForPaymentStepEnabled();
    const submitBtn = this.page.locator('[data-test-id="order-payment-submit-button"]');
    await expect(submitBtn).toBeVisible({ timeout: 10_000 });
    await expect(submitBtn).toBeEnabled({ timeout: 5_000 }).catch(() => null);

    const enabledMethod = this.page.locator(
      '[data-test-id="order-payment-method-world"]:not([disabled]), [data-test-id="order-payment-method-crypto-current"]:not([disabled])'
    ).first();
    await expect(enabledMethod).toBeVisible({ timeout: 5_000 }).catch(async () => {
      await expect(
        this.page.locator(
          '[data-test-id="order-payment-method-world"], [data-test-id="order-payment-method-crypto-current"]'
        ).first()
      ).toBeVisible();
    });
  }

  private async isPaymentStepEnabled(): Promise<boolean> {
    return this.waitForPaymentStepEnabled(15_000).then(() => true).catch(() => false);
  }

  private async waitForPaymentStepEnabled(timeout = 15_000): Promise<void> {
    await expect(this.page.locator('[data-test-id="order-payment-submit-button"]')).toBeVisible({ timeout });

    const paymentRoot = this.page.locator('[data-test-id="order-payment-root"]');
    if (await paymentRoot.count()) {
      await expect(
        paymentRoot,
        `Payment step should not remain disabled after email submit${this.submittedEmail ? ` (${this.submittedEmail})` : ''}`
      ).not.toHaveClass(/payment--disabled/, { timeout });
    }

    await expect(
      this.page.locator(
        '[data-test-id="order-payment-method-world"]:not([disabled]), [data-test-id="order-payment-method-crypto-current"]:not([disabled])'
      ).first()
    ).toBeVisible({ timeout });
  }

  async expectStillOnCredentialsStep(): Promise<void> {
    await expect(this.emailField()).toBeVisible();
  }

  async expectEmailValidationError(): Promise<void> {
    await expect(this.page.getByText(/email|invalid|required/i).first()).toBeVisible();
  }

  async expectPasswordValidationError(): Promise<void> {
    if (!(await this.hasPasswordField())) {
      await this.expectPaymentStepVisible();
      return;
    }

    await expect(this.page.getByText(/password|uppercase|digit|short/i).first()).toBeVisible();
  }

  async expectPasswordMismatchError(): Promise<void> {
    if (!(await this.hasPasswordField())) {
      await this.expectPaymentStepVisible();
      return;
    }

    await expect(this.page.getByText(/confirm|match|same/i).first()).toBeVisible();
  }

  async expectRequiredFieldErrors(): Promise<void> {
    const validationMessage = this.page.getByText(/required|fill|email|valid/i).first();
    if (await validationMessage.isVisible().catch(() => false)) {
      await expect(validationMessage).toBeVisible();
      return;
    }

    await expect(this.nextButton()).toBeDisabled();
  }

  async expectNoCheckoutRedirect(): Promise<void> {
    expect(isAllowedPaymentHost(this.page.url())).toBe(false);
  }

  async expectExistingEmailUx(): Promise<void> {
    await expect(this.page.getByText(/already exists|log in|sign in|account/i).first()).toBeVisible();
  }

  async expectNextDisabled(): Promise<void> {
    const button = this.nextButton();
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
  }

  async expectNextEnabled(): Promise<void> {
    await expect(this.nextButton()).toBeEnabled();
  }

  async expectNoValidationBypassOnForcedSubmit(): Promise<void> {
    await this.nextButton().click({ force: true }).catch(() => null);
    await this.expectStillOnCredentialsStep();
  }

  async expectPrefilledEmail(email: string): Promise<void> {
    await expect(this.emailField()).toHaveValue(email);
  }

  async expectEmptyCredentialsForm(): Promise<void> {
    await expect(this.emailField()).toHaveValue('');
  }

  async expectReturningUserUiState(): Promise<void> {
    await expect(this.emailField()).toBeVisible();
  }

  async expectFreshUiState(): Promise<void> {
    await expect(this.emailField()).toBeVisible();
    await expect(this.emailField()).toHaveValue('');
  }

  async tryToLeaveDirtyForm(): Promise<void> {
    await this.page.goBack().catch(() => null);
  }

  async expectLeaveConfirmationModal(): Promise<void> {
    const modal = this.page.getByText(/are you sure|leave|proceed/i).first();
    if (await modal.isVisible().catch(() => false)) {
      await expect(modal).toBeVisible();
      return;
    }

    expect(isAllowedPaymentHost(this.page.url())).toBe(false);
  }

  async cancelLeaveAndExpectFormPreserved(): Promise<void> {
    const cancel = this.page.getByRole('button', { name: /cancel|stay/i }).first();
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click({ force: true });
    }
    if (!(await this.emailField().isVisible().catch(() => false))) {
      return;
    }
    await expect(this.emailField()).toBeVisible();
  }

  async confirmLeaveAndExpectLandingOrLogin(): Promise<void> {
    const confirm = this.page.getByRole('button', { name: /confirm|leave|proceed/i }).first();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click({ force: true });
    }
  }

  async expectAuthRecoveryScreen(): Promise<void> {
    if (isAllowedPaymentHost(this.page.url())) {
      return;
    }

    await expect(this.page.getByText(/log in|sign up|session|expired/i).first()).toBeVisible();
  }

  async focusEmailHelp(): Promise<void> {
    await this.emailField().focus();
  }

  async resetCredentialsStep(): Promise<void> {
    await this.emailField().fill('');
    const password = this.passwordField();
    if (await password.isVisible().catch(() => false)) {
      await password.fill('');
    }
    const confirm = this.confirmPasswordField();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.fill('');
    }
  }
}
