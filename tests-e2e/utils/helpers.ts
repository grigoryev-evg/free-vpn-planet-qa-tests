import { Page, expect } from '@playwright/test';
import { allowedPaymentHosts } from '../data/payment_methods';

export const createUniqueEmail = (domain = process.env.SIGNUP_EMAIL_DOMAIN ?? 'example.com'): string => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);
  return `qa${timestamp}${random}@${domain}`;
};

export const normalizeText = (value: string): string => value.trim().toLowerCase();

export const regexFromOptions = (values: readonly string[]): RegExp => {
  const body = values.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(body, 'i');
};

export const getHostname = (url: string): string => new URL(url).hostname.toLowerCase();

export const expectPageHost = async (page: Page, hostname: string): Promise<void> => {
  await expect
    .poll(async () => getHostname(page.url()), { message: `Expected page host to be ${hostname}` })
    .toBe(hostname.toLowerCase());
};

export const isAllowedPaymentHost = (url: string, hosts: readonly string[] = allowedPaymentHosts): boolean => {
  try {
    const hostname = getHostname(url);
    return hosts.some((host) => {
      const normalizedHost = host.toLowerCase();
      return hostname === normalizedHost || hostname.endsWith(`.${normalizedHost}`);
    });
  } catch {
    return false;
  }
};

export const expectAllowedCheckoutTarget = async (page: Page): Promise<void> => {
  await expect
    .poll(async () => isAllowedPaymentHost(page.url()), { message: 'Expected redirect to an allowed hosted payment page' })
    .toBe(true);
};
