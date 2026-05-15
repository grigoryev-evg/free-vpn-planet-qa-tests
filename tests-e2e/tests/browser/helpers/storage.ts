import { Page } from '@playwright/test';

export const clearAllStorage = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
};

export const seedLocalStorage = async (page: Page, data: Record<string, string>): Promise<void> => {
  await page.addInitScript((entries: Record<string, string>) => {
    Object.entries(entries).forEach(([key, value]) => window.localStorage.setItem(key, value));
  }, data);
};

export const seedSessionStorage = async (page: Page, data: Record<string, string>): Promise<void> => {
  await page.addInitScript((entries: Record<string, string>) => {
    Object.entries(entries).forEach(([key, value]) => window.sessionStorage.setItem(key, value));
  }, data);
};
