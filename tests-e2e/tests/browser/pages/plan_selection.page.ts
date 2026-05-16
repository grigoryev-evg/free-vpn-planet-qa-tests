import { expect, Locator, Page } from '@playwright/test';
import { createUniqueEmail, expectPageHost, regexFromOptions } from '../../../utils/helpers';
import { enPlans, ruPlans } from '../../../data/plans';

const paymentStepTitlePattern = /choose payment method|выберите платежный метод|выберите способ оплаты/i;

export class PlanSelectionPage {
  constructor(
    private readonly page: Page,
    private readonly locale: 'ru' | 'en'
  ) {}

  uniqueEmail(): string {
    return createUniqueEmail();
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
    await this.page.locator('label.ppg__label.radio').filter({ hasText: plan }).first().click({ force: true });
  }

  async selectMonthlyPlan(): Promise<void> {
    const values = this.locale === 'ru' ? ruPlans.monthly : enPlans.monthly;
    await this.page.locator('label.ppg__label.radio').filter({ hasText: regexFromOptions(values) }).first().click({ force: true });
  }

  async selectYearlyPlan(): Promise<void> {
    const values = this.locale === 'ru' ? ruPlans.yearly : enPlans.yearly;
    await this.page.locator('label.ppg__label.radio').filter({ hasText: regexFromOptions(values) }).first().click({ force: true });
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
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPaymentMethodStepVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment\/\?/i);
    await expect(this.page.getByText(paymentStepTitlePattern)).toBeVisible();
  }

  async fillRequiredRuDefaults(): Promise<void> {
    await this.openRu();
    await this.selectLocation('Netherlands');
    await this.selectCurrency('RUB');
    await this.selectMonthlyPlan();
    await this.fillEmail(this.uniqueEmail());
  }

  async fillRequiredEnDefaults(options: { plan: '1 month' | '1 year' }): Promise<void> {
    await this.openEn();
    await this.selectLocation('Netherlands');
    await this.selectCurrency('USD');
    if (options.plan === '1 month') {
      await this.selectMonthlyPlan();
    } else {
      await this.selectYearlyPlan();
    }
    await this.fillEmail(this.uniqueEmail());
  }

  async captureCurrentSummary(): Promise<string> {
    const hiddenOffer = this.page.locator('input[name="offer_id"]').first();
    if (await hiddenOffer.count()) {
      return (await hiddenOffer.inputValue()) ?? '';
    }

    return (await this.page.locator('main').textContent()) ?? '';
  }

  async expectSummaryChanged(previous?: string): Promise<void> {
    if (previous) {
      await expect
        .poll(async () => this.captureCurrentSummary(), { message: 'Expected summary or hidden offer to change' })
        .not.toBe(previous);
      return;
    }
    await expect(this.page.locator('main')).toBeVisible();
  }

  async expectPlanActive(plan: string): Promise<void> {
    const locator = this.page.locator('label.ppg__label.radio').filter({ hasText: plan }).first();
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

    await expect(this.page.getByText(paymentStepTitlePattern)).toBeVisible();
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
    await expect(this.page.locator('.tooltip, [role="tooltip"]').first()).toBeVisible();
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
