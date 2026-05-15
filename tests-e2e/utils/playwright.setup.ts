import { BrowserContext, Page } from '@playwright/test';

export const clearRuntimeState = async (context: BrowserContext, page: Page): Promise<void> => {
  await context.clearCookies();
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
};
