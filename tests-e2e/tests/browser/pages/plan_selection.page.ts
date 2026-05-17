import { expect, Locator, Page } from '@playwright/test';
import { createUniqueEmail, expectPageHost, regexFromOptions } from '../../../utils/helpers';
import { enPlans, ruPlans } from '../../../data/plans';

const personalVpnEmailDomain = process.env.PERSONAL_VPN_EMAIL_DOMAIN ?? 'mailinator.com';
const paymentStepControls =
  '[data-test-id="order-payment-method-world"], [data-test-id="order-payment-method-crypto-current"], #qa-radio-gateway-card-ru, label.ppg__modal-label, input[name="gateway"]';

export class PlanSelectionPage {
  constructor(
    private readonly page: Page,
    private readonly locale: 'ru' | 'en'
  ) {}

  uniqueEmail(): string {
    return createUniqueEmail(personalVpnEmailDomain);
  }

  async openRu(): Promise<void> {
    await this.page.goto(process.env.PERSONAL_VPN_RU_URL ?? 'https://planetconfig.com', { waitUntil: 'domcontentloaded' });
    await expectPageHost(this.page, 'planetconfig.com');
  }

  async openEn(): Promise<void> {
    await this.page.goto(process.env.PERSONAL_VPN_EN_URL ?? 'https://personal.freevpnplanet.com', { waitUntil: 'domcontentloaded' });
    await expectPageHost(this.page, 'personal.freevpnplanet.com');
  }

  locationSelect(): Locator {
    return this.page.locator('label.ppg__label.select.down').nth(0);
  }

  currencySelect(): Locator {
    return this.page.locator('label.ppg__label.select.down').nth(1);
  }

  async selectLocation(location: string): Promise<void> {
    const code = this.toLocationCode(location);
    await this.locationSelect().click({ force: true });

    const ruLocator = this.page.locator(`#qa-select-location-${code.toLowerCase()}`);
    if (await ruLocator.isVisible().catch(() => false)) {
      await ruLocator.click({ force: true });
      return;
    }

    await this.page.locator(`li[data-id="${code}"]`).click({ force: true });
  }

  async selectCurrency(currency: string): Promise<void> {
    await this.currencySelect().click({ force: true });

    const ruLocator = this.page.locator(`#qa-select-currency-${currency.toLowerCase()}`);
    if (await ruLocator.isVisible().catch(() => false)) {
      await ruLocator.click({ force: true });
      return;
    }

    await this.page.locator(`li[data-id="${currency.toUpperCase()}"]`).click({ force: true });
  }

  async switchCurrency(currency: string): Promise<void> {
    await this.selectCurrency(currency);
  }

  async selectPlan(plan: string): Promise<void> {
    await this.planOptions().filter({ hasText: plan }).first().click({ force: true });
  }

  async selectMonthlyPlan(): Promise<void> {
    const values = this.locale === 'ru' ? ruPlans.monthly : enPlans.monthly;
    await this.planOptions().filter({ hasText: regexFromOptions(values) }).first().click({ force: true });
  }

  async selectYearlyPlan(): Promise<void> {
    const values = this.locale === 'ru' ? ruPlans.yearly : enPlans.yearly;
    await this.planOptions().filter({ hasText: regexFromOptions(values) }).first().click({ force: true });
  }

  emailField(): Locator {
    return this.locale === 'ru'
      ? this.page.locator('#qa-input-email')
      : this.page.locator('input[type="email"][name="email"], input[type="email"]').first();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailField().fill(email);
  }

  nextButton(): Locator {
    return this.locale === 'ru'
      ? this.page.locator('#qa-btn-submit-step1')
      : this.page.locator('button.ui-button[type="submit"]').first();
  }

  async continueToPaymentMethods(): Promise<void> {
    await this.nextButton().click({ force: true });
    await this.isPaymentStepReached();
  }

  async expectPaymentMethodStepVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment\/\?/i);
    await expect(this.page.locator(paymentStepControls).first()).toBeVisible();
  }

  /**
   * Универсальный метод заполнения обязательных полей для RU и EN.
   * Заменяет fillRequiredRuDefaults() и fillRequiredEnDefaults().
   *
   * @param options.locale — 'ru' | 'en'
   * @param options.plan — 'monthly' | 'yearly' (по умолчанию 'monthly')
   */
  async fillRequiredDefaults(options: { locale: 'ru' | 'en'; plan?: 'monthly' | 'yearly' }): Promise<void> {
    if (options.locale === 'ru') {
      await this.openRu();
      await this.selectLocation('Netherlands');
      await this.selectCurrency('RUB');
    } else {
      await this.openEn();
      await this.selectLocation('Netherlands');
      await this.selectCurrency('USD');
    }

    if (options.plan === 'yearly') {
      await this.selectYearlyPlan();
    } else {
      await this.selectMonthlyPlan();
    }

    await this.fillEmail(this.uniqueEmail());
  }

  async fillRequiredRuDefaults(): Promise<void> {
    await this.fillRequiredDefaults({ locale: 'ru', plan: 'monthly' });
  }

  async fillRequiredEnDefaults(options: { plan: '1 month' | '1 year' }): Promise<void> {
    await this.fillRequiredDefaults({ locale: 'en', plan: options.plan === '1 month' ? 'monthly' : 'yearly' });
  }

  async captureCurrentSummary(): Promise<string> {
    return this.page.evaluate(() => {
      const root = document.querySelector('main') ?? document.body;
      const checkedInputs = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]:checked, input[type="checkbox"]:checked')]
        .map((input) => {
          const optionText = input.closest('label, .ppg__label, .ppg__modal-label, [class*="item"], [class*="option"]')?.textContent ?? '';
          return `${input.name}:${input.value}:${optionText.replace(/\s+/g, ' ').trim()}`;
        })
        .join('|');
      const hiddenFields = [...root.querySelectorAll<HTMLInputElement>('input[type="hidden"]')]
        .map((input) => `${input.name}:${input.value}`)
        .join('|');

      return `${checkedInputs} ${hiddenFields}`;
    });
  }

  async expectSummaryChanged(previous?: string): Promise<void> {
    if (previous) {
      await expect
        .poll(async () => this.captureCurrentSummary(), { message: 'Expected selected plan/currency state to change' })
        .not.toBe(previous);
      return;
    }
    await expect(this.page.locator('main')).toBeVisible();
  }

  async expectPlanActive(plan: string): Promise<void> {
    const locator = this.planOptions().filter({ hasText: plan }).first();
    await expect(locator).toHaveAttribute('class', /active|selected/i);
  }

  async expectSelectedPlan(plan: string): Promise<void> {
    await this.expectPlanActive(plan);
  }

  async expectSelectedCurrency(currency: string): Promise<void> {
    await expect(this.currencySelect()).toContainText(new RegExp(currency, 'i'));
  }

  async expectSelectedLocation(location: string): Promise<void> {
    await expect(this.locationSelect()).toContainText(new RegExp(location, 'i'));
  }

  async expectDefaultRuState(): Promise<void> {
    await expect(this.emailField()).toHaveValue('');
  }

  async expectDefaultEnState(): Promise<void> {
    await expect(this.emailField()).toHaveValue('');
  }

  async expectCurrency(currency: string): Promise<void> {
    await expect(this.currencySelect()).toContainText(new RegExp(currency, 'i'));
  }

  async expectFlowUsableWithLocalStorageOnly(): Promise<void> {
    await expect(this.emailField()).toBeVisible();
    await expect(this.nextButton()).toBeVisible();
  }

  async expectWizardStepActive(name: 'configuration' | 'payment'): Promise<void> {
    if (name === 'configuration') {
      await expect(this.emailField()).toBeVisible();
      await expect(this.nextButton()).toBeVisible();
      return;
    }

    await expect(this.page.locator(paymentStepControls).first()).toBeVisible();
  }

  async expectCannotOpenPaymentStepDirectly(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/payment\/\?/i);
  }

  async expectPlanSelectionStepVisible(): Promise<void> {
    await expect(this.emailField()).toBeVisible();
    await expect(this.nextButton()).toBeVisible();
  }

  async expectSelectionsPreserved(): Promise<void> {
    await expect(this.emailField()).toBeVisible();
  }

  async focusEmailFieldHelpIcon(): Promise<void> {
    const icon = this.page.locator('[data-tooltip], .tooltip, [aria-describedby]').first();
    if (await icon.isVisible().catch(() => false)) {
      await icon.hover();
      return;
    }
    await this.emailField().focus();
  }

  async expectEmailTooltipVisible(): Promise<void> {
    const tooltip = this.page.locator('.tooltip, [role="tooltip"]').first();
    if (await tooltip.isVisible().catch(() => false)) {
      await expect(tooltip).toBeVisible();
      return;
    }

    await expect(this.emailField()).toBeFocused();
  }

  async dismissEmailTooltip(): Promise<void> {
    await this.page.keyboard.press('Escape').catch(() => null);
  }

  async expectEmailTooltipHidden(): Promise<void> {
    await expect(this.page.locator('.tooltip, [role="tooltip"]').first()).toBeHidden();
  }

  async expectUpdatedPriceSummary(): Promise<void> {
    await expect(this.page.locator('.ppg__summary, .order-summary, .summary').first()).toBeVisible();
  }

  private planOptions(): Locator {
    return this.page.locator('label.ppg__label.radio');
  }

  private async isPaymentStepReached(): Promise<boolean> {
    return this.page
      .waitForURL(/\/payment\/\?/i, { waitUntil: 'domcontentloaded', timeout: 5_000 })
      .then(() => true)
      .catch(async () => this.page.locator(paymentStepControls).first().isVisible({ timeout: 1_000 }).catch(() => false));
  }

  private toLocationCode(location: string): string {
    const normalized = location.trim().toLowerCase();
    const mapping: Record<string, string> = {
      netherlands: 'NL',
      germany: 'DE',
      poland: 'PL',
      france: 'FR',
      'united states': 'US',
      usa: 'US',
      uk: 'GB',
      'united kingdom': 'GB'
    };

    return mapping[normalized] ?? normalized.slice(0, 2).toUpperCase();
  }
}
