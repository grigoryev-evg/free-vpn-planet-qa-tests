import { expect, Page } from '@playwright/test';
import { expectAllowedCheckoutTarget, expectPageHost, isAllowedPaymentHost } from '../../../utils/helpers';
import { checkoutLinkHost, type CryptoCurrency } from '../../../data/payment_methods';

export class PaymentPage {
  constructor(private readonly page: Page) {}

  async expectHostedProvider(hosts?: readonly string[]): Promise<void> {
    if (hosts?.length) {
      await expect.poll(async () => isAllowedPaymentHost(this.page.url(), hosts)).toBe(true);
      return;
    }

    await expectAllowedCheckoutTarget(this.page);
  }

  /** Assert that the current page hostname matches the expected host string */
  async expectHost(host: string): Promise<void> {
    await expectPageHost(this.page, host);
  }

  async expectAllowedProviderHost(): Promise<void> {
    await expect.poll(async () => isAllowedPaymentHost(this.page.url())).toBe(true);
  }

  async expectPaymentSubmittedOrAllowedHost(): Promise<void> {
    await expect
      .poll(async () => {
        const url = this.page.url();
        if (isAllowedPaymentHost(url)) return true;

        // Crypto payments stay on the same host — check for invoice / success indicators
        const body = (await this.page.locator('body').textContent().catch(() => null)) ?? '';
        return /invoice|payment.*address|amount.*btc|amount.*eth|crypto.*address|payment.*submitted|success/i.test(body);
      })
      .toBe(true);
  }

  async expectFailedPaymentState(): Promise<void> {
    await expect
      .poll(async () => `${this.page.url()} ${(await this.page.locator('body').textContent().catch(() => '')) ?? ''}`)
      .toMatch(/failed|declined|error|mocked declined payment/i);
  }

  /** Assert that the page is on Stripe checkout (checkout.stripe.com) */
  async expectStripeCheckout(): Promise<void> {
    await expect
      .poll(
        async () => {
          const hostname = new URL(this.page.url()).hostname.toLowerCase();
          return hostname === 'checkout.stripe.com';
        },
        { message: 'Expected to be on checkout.stripe.com' },
      )
      .toBe(true);
  }

  /**
   * Click "Оплата с Link" / "Pay with Link" inside the Stripe express-checkout iframe.
   * Opens a new browser tab at `checkout.link.com/…`. Returns the Link page URL.
   */
  async clickLinkAndExpectLinkCheckout(): Promise<string> {
    const context = this.page.context();

    // The Link button lives inside the express-checkout iframe (named __privateStripeFrame*)
    const frames = this.page.frames();
    const expressFrame = frames.find(
      (f) =>
        f.url().includes('elements-inner-express-checkout') &&
        f.name().startsWith('__privateStripeFrame'),
    );

    if (!expressFrame) {
      throw new Error('Express checkout iframe not found on Stripe page');
    }

    const linkBtn = expressFrame.getByRole('button', { name: /Оплата с Link|Pay with Link/i });
    await expect(linkBtn.first(), 'Link button should be visible').toBeVisible({ timeout: 5000 });

    const newPagePromise = context.waitForEvent('page', { timeout: 15_000 });
    await linkBtn.first().click();

    const newPage = await newPagePromise;
    await newPage.waitForLoadState('domcontentloaded');
    const url = newPage.url();

    expect(url, 'Expected checkout.link.com popup').toMatch(
      new RegExp(`^https://${checkoutLinkHost}/`),
    );

    // Cleanup: close the Link popup
    await newPage.close();

    return url;
  }

  /** Assert that the page is on CoinPayments (coinpayments.net) */
  async expectCoinPaymentsCheckout(): Promise<void> {
    await expect
      .poll(
        async () => new URL(this.page.url()).hostname.toLowerCase(),
        { message: 'Expected to be on www.coinpayments.net' },
      )
      .toBe('www.coinpayments.net');
  }

  /** Assert that wallet address and/or QR code is visible on CoinPayments page */
  async expectWalletAddressOrQr(): Promise<void> {
    const body = (await this.page.locator('body').textContent().catch(() => null)) ?? '';
    const hasAddress = /wallet|address|pay\s*to|send\s*to|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|0x[0-9a-fA-F]{40}|T[a-km-zA-HJ-NP-Z1-9]{33}/i.test(body);
    const hasQr = (await this.page.locator('img[src*="qr"], canvas, .qr-code, .qrcode, [class*="qr"]').count()) > 0;

    await expect(hasAddress || hasQr, 'Expected wallet address or QR code to be visible on CoinPayments page').toBe(true);
  }

  async expectCoinPaymentsCurrency(currency: CryptoCurrency): Promise<void> {
    const text = await this.page.locator('body').textContent({ timeout: 10_000 });
    const normalized = (text ?? '').replace(/\s+/g, ' ');
    const escapedName = currency.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const primaryCode = currency.code.split('_')[0];

    expect(
      normalized,
      `Expected CoinPayments page to contain selected currency ${currency.name} (${currency.code})`
    ).toMatch(new RegExp(`${escapedName}|\\b${primaryCode}\\b`, 'i'));

    const networkPatterns: Partial<Record<NonNullable<CryptoCurrency['network']>, RegExp>> = {
      btc: /\bBTC\b|bitcoin|bc1|[13][a-km-zA-HJ-NP-Z1-9]{25,34}/i,
      lightning: /lightning|\bLN\b|lnbc/i,
      bch: /\bBCH\b|bitcoin cash/i,
      ltc: /\bLTC\b|litecoin/i,
      erc20: /erc20|ethereum|0x[0-9a-fA-F]{40}/i,
      trc20: /trc20|tron|T[a-km-zA-HJ-NP-Z1-9]{33}/i,
      solana: /solana|\bSOL\b/i
    };

    if (currency.network) {
      const pattern = networkPatterns[currency.network];
      expect(pattern, `Missing network assertion pattern for ${currency.network}`).toBeDefined();
      expect(
        normalized,
        `Expected CoinPayments page to expose ${currency.network} network for ${currency.name}`
      ).toMatch(pattern!);
    }
  }
}
