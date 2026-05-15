import { expect, Page } from '@playwright/test';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async acceptCookiesIfPresent(): Promise<void> {
    const acceptButton = this.page.getByRole('button', { name: /^accept$/i });
    if (await acceptButton.isVisible().catch(() => false)) {
      await acceptButton.click({ force: true });
    }
  }

  async openSignUp(): Promise<void> {
    await this.page.getByRole('link', { name: /sign up/i }).click();
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.locator('input[placeholder="Enter email"]').fill(email);
  }

  async goToPaymentStep(): Promise<void> {
    await this.page.getByRole('button', { name: /^next$/i }).click({ force: true });
  }

  async choosePaymentMethod(methodName: string): Promise<void> {
    const normalized = methodName.toLowerCase();

    if (normalized.includes('card')) {
      await this.page.locator('[data-test-id="order-payment-method-world"]').click({ force: true });
      return;
    }

    if (normalized.includes('crypto')) {
      await this.page.locator('[data-test-id="order-payment-method-crypto-current"]').click({ force: true });
      return;
    }
  }

  async expectPaymentMethodsVisible(): Promise<void> {
    await expect(this.page.locator('[data-test-id="order-payment-method-world"]')).toBeVisible();
    await expect(this.page.locator('[data-test-id="order-payment-method-crypto-current"]')).toBeVisible();
    await expect(this.page.locator('[data-test-id="order-payment-submit-button"]')).toBeVisible();
  }

  async acceptTerms(): Promise<void> {
    await this.page.locator('#payment-checkbox').focus();
    await this.page.keyboard.press('Space');
    await expect(this.page.locator('#payment-checkbox')).toBeChecked();
  }

  async submitSubscription(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 15_000 }).catch(() => null);
    const navigationPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => null);

    await this.page.locator('[data-test-id="order-payment-submit-button"]').click({ force: true });

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      return popup;
    }

    await navigationPromise;
    return this.page;
  }

  async expectHostedCheckout(targetPage: Page): Promise<void> {
    await expect.poll(async () => {
      const url = targetPage.url();
      return /checkout\.stripe\.com|payment\/failed\//i.test(url);
    }, {
      message: 'Expected hosted payment page for Sign Up checkout'
    }).toBeTruthy();
    await expect(targetPage).toHaveTitle(/planet vpn|failed/i);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/account\.freevpnplanet\.com/i);
  }
}
