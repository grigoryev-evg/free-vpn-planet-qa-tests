import { expect, Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async open(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/freevpnplanet\.com/i);
  }

  async openLogin(): Promise<void> {
    await this.page.getByRole('link', { name: /log in/i }).click();
  }
}
