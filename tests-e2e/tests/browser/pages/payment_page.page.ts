import { expect, Page } from '@playwright/test';
import { expectAllowedCheckoutTarget, isAllowedPaymentHost } from '../../../utils/helpers';

export class PaymentPage {
  constructor(private readonly page: Page) {}

  async expectHostedProvider(hosts?: readonly string[]): Promise<void> {
    if (hosts?.length) {
      await expect.poll(async () => isAllowedPaymentHost(this.page.url(), hosts)).toBe(true);
      return;
    }

    await expectAllowedCheckoutTarget(this.page);
  }

  async expectAllowedProviderHost(): Promise<void> {
    await expect.poll(async () => isAllowedPaymentHost(this.page.url())).toBe(true);
  }

  async expectFailedPaymentState(): Promise<void> {
    await expect
      .poll(async () => `${this.page.url()} ${(await this.page.locator('body').textContent().catch(() => '')) ?? ''}`)
      .toMatch(/failed|declined|error|mocked declined payment/i);
  }
}
