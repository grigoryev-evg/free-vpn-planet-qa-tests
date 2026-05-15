import { BrowserContext, Cookie } from '@playwright/test';

export const seedCookies = async (context: BrowserContext, cookies: Cookie[]): Promise<void> => {
  await context.addCookies(cookies);
};

export const expireCookie = async (
  context: BrowserContext,
  name: string,
  domain = '.freevpnplanet.com',
  path = '/'
): Promise<void> => {
  await context.addCookies([
    {
      name,
      value: '',
      domain,
      path,
      expires: 1,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax'
    }
  ]);
};
