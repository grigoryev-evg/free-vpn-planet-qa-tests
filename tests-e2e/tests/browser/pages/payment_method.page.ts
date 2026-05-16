import { expect, Locator, Page } from '@playwright/test';

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
      await signupCard.click();
      return;
    }

    const ruCard = this.page.locator('#qa-radio-gateway-card-ru');
    if (await ruCard.count()) {
      await ruCard.evaluate((input: HTMLInputElement) => input.click());
      return;
    }

    await this.page.locator('label.ppg__modal-label').filter({ hasText: /credit card|bank card/i }).first().click();
  }

  async selectRuBankCard(): Promise<void> {
    await this.selectCard();
  }

  async selectEnBankCard(): Promise<void> {
    await this.selectCard();
  }

  async selectCrypto(): Promise<void> {
    const signupCrypto = this.page.locator('[data-test-id="order-payment-method-crypto-current"]');
    if (await signupCrypto.isVisible().catch(() => false)) {
      await signupCrypto.click();
      return;
    }

    const cryptoButton = this.page.getByRole('button', { name: /select cryptocurrency|выберите криптовалюту/i });
    await cryptoButton.click();
    await this.page.locator('button.order-payment__item-select').first().click();

    const hiddenGateway = this.page.locator('#qa-radio-crypto, input[name="gateway"].js-input-payment').first();
    if (await hiddenGateway.count()) {
      await hiddenGateway.evaluate((input: HTMLInputElement) => input.click());
    }
  }

  async selectRuCrypto(_currency = 'BTC'): Promise<void> {
    await this.selectCrypto();
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

  async submitSubscription(): Promise<Page> {
    return this.submitPayment();
  }

  async submitPayment(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 15_000 }).catch(() => null);
    const navigationPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => null);

    await expect(this.submitButton()).toBeEnabled();
    await this.submitButton().click();

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      return popup;
    }

    await navigationPromise;
    return this.page;
  }

  async clickSubmitAndExpectLoadingState(): Promise<void> {
    await expect(this.submitButton()).toBeEnabled();
    await this.submitButton().click();
    await expect(this.submitButton()).toContainText(/loading|processing|paying/i);
  }

  async expectLoadingLabel(): Promise<void> {
    await expect(this.submitButton()).toContainText(/loading|processing|paying/i);
  }

  async goBackFromPaymentStep(): Promise<void> {
    const backButton = this.page.getByRole('button', { name: /back|cancel|назад/i }).first();
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click({ force: true });
      return;
    }

    await this.page.goBack();
  }

  async triggerChangePlan(): Promise<void> {
    const changePlan = this.page.getByRole('button', { name: /change plan|изменить план/i }).first();
    if (await changePlan.isVisible().catch(() => false)) {
      await changePlan.click({ force: true });
      return;
    }

    await this.page.goBack();
  }

  async expectConfirmDialog(): Promise<void> {
    await expect(this.page.getByText(/are you sure|confirm|подтвердите/i).first()).toBeVisible();
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
    await expect(this.page.getByText(/try again|error|failed/i).first()).toBeVisible();
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
}
