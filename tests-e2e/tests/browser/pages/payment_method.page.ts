import { expect, Locator, Page } from '@playwright/test';
import { isAllowedPaymentHost } from '../../../utils/helpers';

const paymentMethodLocator =
  '[data-test-id="order-payment-method-world"], [data-test-id="order-payment-method-crypto-current"], #qa-radio-gateway-card-ru, button.order-payment__item-select, label.ppg__modal-label';

export class PaymentMethodPage {
  constructor(private readonly page: Page) {}

  submitButton(): Locator {
    return this.page
      .locator('[data-test-id="order-payment-submit-button"], #qa-btn-submit-step2, button.ui-button[type="submit"]')
      .first();
  }

  async expectPaymentMethodsVisible(): Promise<void> {
    await expect(this.page.locator(paymentMethodLocator).first()).toBeVisible();
  }

  async selectCard(): Promise<void> {
    const signupCard = this.page.locator('[data-test-id="order-payment-method-world"]');
    if (await signupCard.isVisible().catch(() => false)) {
      await expect(signupCard).toBeEnabled({ timeout: 5_000 }).catch(() => null);
      await signupCard.click({ force: true });
      return;
    }

    const ruCard = this.page.locator('#qa-radio-gateway-card-ru');
    if (await ruCard.count()) {
      await ruCard.evaluate((input: HTMLInputElement) => input.click());
      return;
    }

    await this.page.locator('label.ppg__modal-label').filter({ hasText: /credit card|bank card/i }).first().click();
  }

  async hasEnabledCard(): Promise<boolean> {
    const signupCard = this.page.locator('[data-test-id="order-payment-method-world"]');
    if (await signupCard.isVisible().catch(() => false)) {
      return signupCard.isEnabled().catch(() => false);
    }

    const ruCard = this.page.locator('#qa-radio-gateway-card-ru');
    if (await ruCard.count()) {
      return ruCard.isEnabled().catch(() => false);
    }

    const modalCard = this.page.locator('label.ppg__modal-label').filter({ hasText: /credit card|bank card/i }).first();
    return modalCard.isVisible().catch(() => false);
  }

  async selectPaymentMethod(method: 'card' | 'crypto' | 'paypal'): Promise<void> {
    if (method === 'card') return this.selectCard();
    if (method === 'crypto') return this.selectCrypto();
    return this.selectPayPal();
  }

  async selectCrypto(): Promise<void> {
    const signupCrypto = this.page.locator('[data-test-id="order-payment-method-crypto-current"]');
    if (await signupCrypto.isVisible().catch(() => false)) {
      if (await signupCrypto.isEnabled().catch(() => false)) {
        await signupCrypto.click();
        await this.chooseFirstCryptoCurrencyIfNeeded();
        return;
      }
    }

    const ruCryptoButton = this.page.locator('#qa-btn-crypto').first();
    if ((await ruCryptoButton.isVisible().catch(() => false)) && (await ruCryptoButton.isEnabled().catch(() => false))) {
      await ruCryptoButton.click({ force: true });
      await this.chooseFirstCryptoCurrencyIfNeeded();
      return;
    }

    const cryptoButton = this.page.getByRole('button', { name: /select cryptocurrency|crypto|bitcoin|btc/i }).first();
    if ((await cryptoButton.isVisible().catch(() => false)) && (await cryptoButton.isEnabled().catch(() => false))) {
      await cryptoButton.click();
      await this.chooseFirstCryptoCurrencyIfNeeded();
      return;
    }

    const hiddenGateway = this.page.locator('#qa-radio-crypto, input[name="gateway"].js-input-payment').first();
    if (await hiddenGateway.count()) {
      await hiddenGateway.evaluate((input: HTMLInputElement) => input.click());
      await this.chooseFirstCryptoCurrencyIfNeeded();
      return;
    }

    throw new Error('Cryptocurrency payment method is not available for the selected plan');
  }

  async selectPayPal(): Promise<void> {
    await this.page.locator('label.ppg__modal-label').filter({ hasText: /paypal/i }).first().click();
  }

  async acceptTerms(): Promise<void> {
    const roleCheckbox = this.page.getByRole('checkbox').first();
    if (await roleCheckbox.count()) {
      await roleCheckbox.check({ force: true }).catch(async () => {
        await roleCheckbox.evaluate((input: HTMLInputElement) => {
          input.checked = true;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      return;
    }

    const candidates = ['#payment-checkbox', '#qa-checkbox-terms', 'input[name="terms"]'];

    for (const selector of candidates) {
      const locator = this.page.locator(selector).first();
      if (await locator.count()) {
        await locator.check({ force: true }).catch(async () => {
          await locator.evaluate((input: HTMLInputElement) => {
            input.checked = true;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
        });
        return;
      }
    }

    const label = this.page.locator('label.ppg__label.checkbox, label:has-text("Terms of use"), label:has-text("Refund policy")').first();
    if (await label.isVisible().catch(() => false)) {
      await label.click({ force: true });
    }
  }

  async submitPayment(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 15_000 }).catch(() => null);
    const navigationPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => null);

    const btn = this.submitButton();
    await expect(btn).toBeEnabled();
    await btn.click();

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      return popup;
    }

    await navigationPromise;
    return this.page;
  }

  async clickSubmitAndExpectLoadingState(): Promise<void> {
    const button = this.submitButton();
    await expect(button).toBeEnabled();
    await button.click();

    await expect
      .poll(async () => {
        if (isAllowedPaymentHost(this.page.url())) {
          return 'redirected';
        }

        if (!(await button.count())) {
          return 'button-detached';
        }

        const state = await button.evaluate((element: HTMLElement) =>
          [
            element.textContent,
            element.getAttribute('class'),
            element.getAttribute('data-p'),
            element.getAttribute('aria-busy'),
            element.hasAttribute('disabled') ? 'disabled' : ''
          ].join(' ')
        );

        return /loading|processing|paying|disabled|p-button-loading/i.test(state) ? 'loading' : 'idle';
      }, { message: 'Expected submit to enter loading state or redirect to checkout' })
      .toMatch(/loading|redirected|button-detached/);
  }

  async expectLoadingLabel(): Promise<void> {
    await expect(this.submitButton()).toHaveAttribute('class', /loading|disabled/i);
  }

  async goBackFromPaymentStep(): Promise<void> {
    const backButton = this.page.getByRole('button', { name: /back|cancel/i }).first();
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click({ force: true });
      return;
    }

    await this.returnToPlanSelection();
  }

  async triggerChangePlan(): Promise<void> {
    const changePlan = this.page.getByRole('button', { name: /change plan/i }).first();
    if (await changePlan.isVisible().catch(() => false)) {
      await changePlan.click({ force: true });
      return;
    }

    await this.returnToPlanSelection();
  }

  async expectConfirmDialog(): Promise<void> {
    await expect(this.page.getByText(/are you sure|confirm/i).first()).toBeVisible();
  }

  async cancelPlanChangeAndStayOnPayment(): Promise<void> {
    const cancel = this.page.getByRole('button', { name: /cancel|stay/i }).first();
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click({ force: true });
    }
    await expect(this.submitButton()).toBeVisible();
  }

  async confirmPlanChange(): Promise<void> {
    const confirm = this.page.getByRole('button', { name: /confirm|continue|proceed|yes/i }).first();
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click({ force: true });
    }
  }

  async confirmPlanChangeAndReturnToPlanStep(): Promise<void> {
    await this.confirmPlanChange();
  }

  async expectRetryErrorModal(): Promise<void> {
    await expect(this.page.getByText(/try again|error|failed|mocked checkout failure/i).first()).toBeVisible();
  }

  async closeErrorModal(): Promise<void> {
    const close = this.page.getByRole('button', { name: /close|cancel/i }).first();
    if (await close.isVisible().catch(() => false)) {
      await close.click({ force: true });
    }
  }

  async mockCheckoutFailure(): Promise<void> {
    await this.page.route(/checkout|payment/i, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mocked checkout failure' })
      });
    });
  }

  async mockDeclinedPayment(): Promise<void> {
    await this.page.route(/checkout|payment/i, async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mocked declined payment' })
      });
    });
  }

  private async chooseFirstCryptoCurrencyIfNeeded(): Promise<void> {
    const qaItemButton = this.page.locator('[id^="qa-select-crypto-item-"]').first();
    if (await qaItemButton.count()) {
      await qaItemButton.evaluate((button: HTMLButtonElement) => button.click());
      return;
    }

    const itemButton = this.page.locator('button.order-payment__item-select').first();
    if (await itemButton.count()) {
      await itemButton.evaluate((button: HTMLButtonElement) => button.click());
      return;
    }

    const openedItem = this.page.locator('.js-payment-item[data-id], .order-payment__item[data-id], [role="option"], li[data-id]').first();
    if (await openedItem.isVisible().catch(() => false)) {
      await openedItem.click({ force: true });
      return;
    }

    const dropdownButton = this.page.getByRole('button', { name: /dropdown/i }).or(this.page.locator('button:has(img[alt="dropdown"])')).first();
    if ((await dropdownButton.isVisible().catch(() => false)) && (await dropdownButton.isEnabled().catch(() => false))) {
      await dropdownButton.click({ force: true });
      if (await qaItemButton.count()) {
        await qaItemButton.evaluate((button: HTMLButtonElement) => button.click());
        return;
      }
      if (await itemButton.count()) {
        await itemButton.evaluate((button: HTMLButtonElement) => button.click());
        return;
      }
      if (await openedItem.isVisible().catch(() => false)) {
        await openedItem.click({ force: true });
      }
    }
  }

  private async returnToPlanSelection(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => null);

    const emailField = this.page.locator('#qa-input-email, input[type="email"]').first();
    if (await emailField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      return;
    }

    const url = new URL(this.page.url());
    if (url.hostname === 'planetconfig.com' || url.hostname === 'personal.freevpnplanet.com') {
      await this.page.goto(url.origin, { waitUntil: 'domcontentloaded' });
    }
  }
}
