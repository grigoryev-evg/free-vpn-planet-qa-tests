import { expect, Page } from '@playwright/test';
import { expectAllowedCheckoutTarget, expectedPaymentHostPattern } from '../../../utils/helpers';

export class PaymentPage {
  constructor(private readonly page: Page) {}

  async expectHostedProvider(hosts?: readonly string[]): Promise<void> {
    if (hosts?.length) {
      const pattern = new RegExp(hosts.map((host) => host.replace(/\./g, '\\.')).join('|'), 'i');
      await expect.poll(async () => this.page.url()).toMatch(pattern);
      return;
    }

    await expectAllowedCheckoutTarget(this.page);
  }

  async expectAllowedProviderHost(): Promise<void> {
    await expect.poll(async () => this.page.url()).toMatch(expectedPaymentHostPattern);
  }

  async expectFailedPaymentState(): Promise<void> {
    await expect.poll(async () => this.page.url()).toMatch(/failed|declined|error/i);
  }
}
