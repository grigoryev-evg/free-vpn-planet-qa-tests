import { expect, Locator, Page } from '@playwright/test';
import { isAllowedPaymentHost } from '../../../utils/helpers';

const paymentMethodLocator =
  '[data-test-id="order-payment-method-world"], [data-test-id="order-payment-method-crypto-current"], #qa-radio-gateway-card-ru, button.order-payment__item-select, label.ppg__modal-label';
const cryptoOptionLocator =
  '[data-test-id="order-payment-method-crypto-options"] [data-test-id^="order-payment-method-crypto-option-"], [data-test-id^="order-payment-method-crypto-option-"], .js-payment-item, [id^="qa-select-crypto-item-"], [role="option"]';

export class PaymentMethodPage {
  constructor(private readonly page: Page) {}

  submitButton(): Locator {
    return this.page
      .locator('[data-test-id="order-payment-submit-button"], #qa-btn-submit-step2, button.ui-button[type="submit"], button:has-text("Оплатить"), button:has-text("Pay"), button:has-text("Get your subscription")')
      .first();
  }

  async expectPaymentMethodsVisible(): Promise<void> {
    await expect(this.page.locator(paymentMethodLocator).first()).toBeVisible();
  }

  async selectCard(): Promise<void> {
    await this.waitForSignupPaymentReady();
    const signupCard = this.page.locator('[data-test-id="order-payment-method-world"]');
    if (await signupCard.isVisible().catch(() => false)) {
      // Wait for the card button to actually become enabled (page may still be initializing)
      await expect(signupCard).toBeEnabled({ timeout: 15_000 });
      await signupCard.click();
      return;
    }

    const creditCard = this.page
      .locator('label, label.ppg__modal-label, button')
      .filter({ hasText: /(^|\s)credit card(\s|$)/i })
      .first();
    if (await creditCard.isVisible().catch(() => false)) {
      await creditCard.click({ force: true });
      return;
    }

    const ruCard = this.page.locator('#qa-radio-gateway-card-ru');
    if (await ruCard.count()) {
      await ruCard.check({ force: true });
      return;
    }

    await this.page.locator('label.ppg__modal-label').filter({ hasText: /credit card|bank card/i }).first().click({ force: true });
  }

  async selectRfBankCard(): Promise<void> {
    const radioCard = this.page.locator('label').filter({ hasText: /карты банков рф|банковская карта/i }).first();
    if (await radioCard.isVisible().catch(() => false)) {
      await radioCard.click({ force: true });
      return;
    }

    const ruCard = this.page.locator('#qa-radio-gateway-card-ru');
    if (await ruCard.count()) {
      await ruCard.check({ force: true });
      return;
    }

    throw new Error('RF bank card payment method is not available');
  }

  async selectSbp(): Promise<void> {
    const radioSbp = this.page.locator('label').filter({ hasText: /система быстрых платежей|сбп|fast payment/i }).first();
    if (await radioSbp.isVisible().catch(() => false)) {
      await radioSbp.click({ force: true });
      return;
    }
    throw new Error('SBP payment method is not available');
  }

  async selectSberPay(): Promise<void> {
    const radioSber = this.page.locator('label').filter({ hasText: /sberpay|sber pay/i }).first();
    if (await radioSber.isVisible().catch(() => false)) {
      await radioSber.click({ force: true });
      return;
    }
    throw new Error('SberPay payment method is not available');
  }

  async selectYooMoney(): Promise<void> {
    const radioYoo = this.page.locator('label').filter({ hasText: /юmoney|ю money|yoomoney/i }).first();
    if (await radioYoo.isVisible().catch(() => false)) {
      await radioYoo.click({ force: true });
      return;
    }
    throw new Error('YooMoney payment method is not available');
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

  async selectPaymentMethod(method: 'card' | 'credit_card' | 'rf_bank_card' | 'sbp' | 'sberpay' | 'yoomoney' | 'crypto'): Promise<void> {
    if (method === 'card') return this.selectCard();
    if (method === 'credit_card') return this.selectCard();
    if (method === 'rf_bank_card') return this.selectRfBankCard();
    if (method === 'sbp') return this.selectSbp();
    if (method === 'sberpay') return this.selectSberPay();
    if (method === 'yoomoney') return this.selectYooMoney();
    return this.selectCrypto();
  }

  async selectCrypto(): Promise<void> {
    await this.waitForSignupPaymentReady();
    // account.freevpnplanet.com signup flow: crypto is already the container with dropdown
    const signupCrypto = this.page.locator('[data-test-id="order-payment-method-crypto-current"]');
    if (await signupCrypto.isVisible().catch(() => false)) {
      await expect(signupCrypto).toBeEnabled({ timeout: 15_000 });
      await signupCrypto.click();
      await expect(this.page.locator(cryptoOptionLocator).first()).toBeVisible({ timeout: 10_000 });
      return;
    }

    const cryptoGateway = this.page.locator('#qa-radio-crypto, input[name="gateway"].js-input-payment').first();
    if (await cryptoGateway.count()) {
      await cryptoGateway.check({ force: true }).catch(async () => {
        await cryptoGateway.evaluate((input: HTMLInputElement) => {
          input.checked = true;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      return;
    }

    await this.openCryptoDropdown();
  }

  /** Open the cryptocurrency dropdown to reveal currency options */
  async openCryptoDropdown(): Promise<void> {
    const cryptoGateway = this.page.locator('#qa-radio-crypto').first();
    if (await cryptoGateway.count()) {
      const ppgDropdown = this.page.locator('button.order-payment__item-select, button:has(img[alt="dropdown"])').first();
      if (await ppgDropdown.isVisible().catch(() => false)) {
        await ppgDropdown.click({ force: true });
        await expect(this.page.locator('.js-payment-item').first()).toBeVisible({ timeout: 10_000 });
        return;
      }
    }

    const visibleOption = this.page.locator(cryptoOptionLocator).first();
    if (await visibleOption.isVisible().catch(() => false)) {
      return;
    }

    const activeDropdown = this.page.locator('.js-select-payment-dropdown.active, [data-test-id="order-payment-method-crypto-overlay"].select__overlay--active').first();
    if (await activeDropdown.isVisible().catch(() => false)) {
      return;
    }

    const dropdownButton = this.page.getByRole('button', { name: /select cryptocurrency/i });
    if (await dropdownButton.isVisible().catch(() => false)) {
      await dropdownButton.click({ force: true });
      // Wait for dropdown options to actually appear (up to 10s for slow CI / parallel workers)
      await expect(this.page.locator(cryptoOptionLocator).first()).toBeVisible({ timeout: 10_000 });
      return;
    }

    // Fallback: any crypto-related button that opens a dropdown
    const cryptoBtn = this.page.getByRole('button', { name: /crypto|bitcoin|btc/i }).first();
    if (await cryptoBtn.isVisible().catch(() => false)) {
      await cryptoBtn.click({ force: true });
      await expect(this.page.locator(cryptoOptionLocator).first()).toBeVisible({ timeout: 10_000 });
      return;
    }

    await expect(visibleOption, 'Cryptocurrency dropdown is not available').toBeVisible({ timeout: 3_000 });
  }

  /** Select a specific crypto currency by its display name */
  async selectCryptoCurrency(name: string, code?: string): Promise<void> {
    await this.openCryptoDropdown();
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (code) {
      const ppgCode = code.replace('_', '.');
      const exactPpgItem = this.page.locator(`.js-payment-item[data-id="${ppgCode}"]`).first();
      if (await exactPpgItem.isVisible().catch(() => false)) {
        await exactPpgItem.click({ force: true });
        await this.expectCryptoGatewayValue(ppgCode);
        return;
      }
    }

    // Try primary: accessible name "method Xxx"
    const targetButton = this.page.getByRole('button', { name: new RegExp(`^method ${escaped}$`, 'i') });
    const primaryVisible = await targetButton.first().isVisible().catch(() => false);
    if (primaryVisible) {
      await targetButton.first().click();
      return;
    }

    // Try fallback: any clickable element (button, role=option, div.js-payment-item, etc.)
    // whose text matches the currency name. Dropdown items may be <div>/<li> elements,
    // not just <button role="button">.
    const fallback = this.page
      .locator(`${cryptoOptionLocator}, button, [role="button"], .select__item`)
      .filter({ hasText: new RegExp(escaped, 'i') })
      .first();

    // If still not found after 5s, try one more: any element whose textContent matches
    try {
      await expect(fallback).toBeVisible({ timeout: 5_000 });
      await fallback.click({ force: true });
    } catch {
      const lastResort = this.page.locator(`text="${name}"`).first();
      await expect(lastResort).toBeVisible({ timeout: 3_000 });
      await lastResort.click({ force: true });
    }

    if (code) {
      await this.expectCryptoGatewayValue(code.replace('_', '.')).catch(() => null);
    }
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
    await btn.scrollIntoViewIfNeeded();
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
    await button.scrollIntoViewIfNeeded();
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
    await this.page.route(/checkout|payment|order|checkout\.freevpnplanet/i, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mocked checkout failure' })
      });
    });
  }

  async mockDeclinedPayment(): Promise<void> {
    await this.page.route(/checkout|payment|order|checkout\.freevpnplanet/i, async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mocked declined payment' })
      });
    });
  }

  private async chooseFirstCryptoCurrencyIfNeeded(): Promise<void> {
    // Click the first visible .js-payment-item div (parent receives click via event delegation)
    const paymentItem = this.page.locator('.js-payment-item').first();
    const isVisible = await paymentItem.isVisible().catch(() => false);
    if (isVisible) {
      await paymentItem.click({ force: true });
      return;
    }

    // Fallback: click via qa-select button
    const qaItemButton = this.page.locator('[id^="qa-select-crypto-item-"]').first();
    if (await qaItemButton.count()) {
      await qaItemButton.click({ force: true });
      return;
    }

    // Fallback: any order-payment__item-select button
    const itemButton = this.page.locator('button.order-payment__item-select').first();
    if (await itemButton.count()) {
      await itemButton.click({ force: true });
      return;
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

  private async waitForSignupPaymentReady(): Promise<void> {
    const root = this.page.locator('[data-test-id="order-payment-root"]');
    if (!(await root.count())) return;

    await expect(root, 'Signup payment step should be enabled before selecting a method')
      .not.toHaveClass(/payment--disabled/, { timeout: 15_000 });
  }

  private async expectCryptoGatewayValue(expectedCode: string): Promise<void> {
    const gateway = this.page.locator('#qa-radio-crypto').first();
    if (!(await gateway.count())) return;

    await expect
      .poll(async () => gateway.inputValue().catch(() => ''), {
        message: `Expected crypto gateway to be ${expectedCode}`
      })
      .toBe(expectedCode);
  }
}
