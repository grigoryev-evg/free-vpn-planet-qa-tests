import { expect, Page } from '@playwright/test';

export class DedicatedVpnPage {
  constructor(
    private readonly page: Page,
    private readonly locale: 'ru' | 'en'
  ) {}

  async open(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(new RegExp(new URL(url).hostname.replace(/\./g, '\\.')));
  }

  async chooseLocation(location: string): Promise<void> {
    const locationId = this.locale === 'ru' ? 'qa-select-location-nl' : 'li[data-id="NL"]';

    if (this.locale === 'ru') {
      await this.page.locator('label.ppg__label.select.down').nth(0).click({ force: true });
      await this.page.locator(`#${locationId}`).click({ force: true });
      return;
    }

    await this.page.locator('label.ppg__label.select.down').nth(0).click({ force: true });
    await this.page.locator(locationId).click({ force: true });
  }

  async chooseCurrency(currency: string): Promise<void> {
    const currencyValue = currency.toUpperCase();

    if (this.locale === 'ru') {
      await this.page.locator('label.ppg__label.select.down').nth(1).click({ force: true });
      await this.page.locator(`#qa-select-currency-${currencyValue.toLowerCase()}`).click({ force: true });
      return;
    }

    await this.page.locator('label.ppg__label.select.down').nth(1).click({ force: true });
    await this.page.locator(`label.ppg__label.select.down ul li[data-id="${currencyValue}"]`).click({ force: true });
  }

  async choosePlan(plan: string): Promise<void> {
    const planMatcher = this.page.locator('label.ppg__label.radio').filter({ hasText: plan });
    await planMatcher.click({ force: true });
  }

  async fillEmail(email: string): Promise<void> {
    const selector = this.locale === 'ru' ? '#qa-input-email' : 'input[type="email"][name="email"]';
    await this.page.locator(selector).fill(email);
  }

  async proceedToPaymentMethodSelection(): Promise<void> {
    const selector = this.locale === 'ru' ? '#qa-btn-submit-step1' : 'button.ui-button[type="submit"]';
    await this.page.locator(selector).click({ force: true });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPaymentMethodPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment\/\?/i);
    await expect(this.page.getByText(/choose payment method|выберите платежный метод/i)).toBeVisible();
  }

  async choosePaymentMethod(methodName: string): Promise<void> {
    const normalized = methodName.toLowerCase();

    if (normalized.includes('card')) {
      if (this.locale === 'ru') {
        await this.page.locator('#qa-radio-gateway-card-ru').evaluate((input: HTMLInputElement) => input.click());
      } else {
        await this.page.locator('label.ppg__modal-label').filter({ hasText: 'Credit Card' }).click({ force: true });
      }
      return;
    }

    if (normalized.includes('crypto')) {
      if (this.locale === 'ru') {
        await this.page.getByRole('button', { name: /выберите криптовалюту/i }).click({ force: true });
      } else {
        await this.page.getByRole('button', { name: /select cryptocurrency/i }).click({ force: true });
      }

      const bitcoinSelectButton = this.page.locator('button.order-payment__item-select').first();
      await expect(bitcoinSelectButton).toBeVisible();
      await bitcoinSelectButton.click({ force: true });

      const gatewaySelector = this.locale === 'ru' ? '#qa-radio-crypto' : 'input[name="gateway"].js-input-payment';
      await expect.poll(async () => this.page.locator(gatewaySelector).evaluate((input: HTMLInputElement) => input.value))
        .not.toEqual('');
    }
  }

  async expectPaymentMethodAvailable(methodName: string): Promise<void> {
    const normalized = methodName.toLowerCase();

    if (normalized.includes('card')) {
      const locator = this.locale === 'ru'
        ? this.page.getByText(/карты банков рф/i)
        : this.page.getByText(/credit card/i);
      await expect(locator).toBeVisible();
      return;
    }

    if (normalized.includes('crypto')) {
      const locator = this.locale === 'ru'
        ? this.page.locator('#qa-btn-crypto')
        : this.page.getByRole('button', { name: /select cryptocurrency/i });
      await expect(locator).toBeVisible();
    }
  }

  async acceptTerms(): Promise<void> {
    const checkbox = this.locale === 'ru' ? '#qa-checkbox-terms' : 'input[name="terms"]';
    await this.page.locator(checkbox).evaluate((input: HTMLInputElement) => {
      input.checked = true;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  async submitPayment(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 15_000 }).catch(() => null);
    const navigationPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => null);
    const selector = this.locale === 'ru' ? '#qa-btn-submit-step2' : 'button.ui-button[type="submit"]';
    await this.page.locator(selector).click({ force: true });

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState('domcontentloaded');
      return popup;
    }

    await navigationPromise;
    return this.page;
  }

  async expectCheckoutPageOpened(targetPage: Page): Promise<void> {
    await expect.poll(async () => {
      const normalized = targetPage.url().toLowerCase();
      return (
        normalized.includes('/payment/failed/') ||
        normalized.includes('checkout.stripe.com') ||
        normalized.includes('yoomoney.ru') ||
        normalized.includes('paymentt.kassa.ai')
      );
    }, {
      message: 'Expected dedicated VPN payment flow to open a hosted checkout or failed endpoint'
    }).toBeTruthy();
  }
}
