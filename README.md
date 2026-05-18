# Free VPN Planet Playwright E2E

Playwright E2E test suite for checkout handoff coverage across:

- `freevpnplanet.com`
- `planetconfig.com`
- `personal.freevpnplanet.com`

The active suite focuses on reaching internal or external payment targets: Stripe, Link, CoinPayments, YooMoney, NSPK QR, kassa.ai, and Telegram bot links. It does not complete real payments.

## Quick Start

```bash
npm ci
npx playwright install chromium
cp .env.example .env
npm test
```

## NPM Scripts

| Script | Description |
|---|---|
| `npm test` | Full Playwright suite |
| `npm run test:assignment` | Checkout handoff scenarios tagged `@assignment` in Chromium |
| `npm run test:smoke` | Short critical-path subset tagged `@smoke` |
| `npm run test:e2e-api` | API/provider allowlist smoke checks |
| `npm run test:signup` | FreeVPNPlanet Sign Up checkout matrix |
| `npm run test:planetconfig` | PlanetConfig checkout matrix |
| `npm run test:personal` | Personal FreeVPNPlanet checkout matrix |
| `npm run test:list` | List discovered tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run report` | Open the HTML report |

## Active Spec Files

| Spec | Tests | Coverage |
|---|---|---|
| `checkout_matrix.e2e.ts` | 19 (1 card + 18 crypto) | FreeVPNPlanet Sign Up → Stripe + Link / CoinPayments |
| `planetconfig_ru.e2e.ts` | 32 | PlanetConfig bot link, RUB local (4 methods), card (1d+3m), crypto BTC (3c×2p), every crypto network (18c) |
| `personal_vpn_en.e2e.ts` | 6 | Personal FreeVPNPlanet RUB/EUR card, SBP, crypto BTC |
| `payment_contract.e2e.ts` | 2 | API health checks and provider allowlist |

**Total:** 59 unique tests in 4 spec files (177 total across 3 browsers: chromium, firefox, webkit).

## Scope

| Domain | Covered payment paths |
|---|---|
| `freevpnplanet.com` | Credit Card to Stripe + Link popup; all 18 crypto currencies to CoinPayments |
| `planetconfig.com` | Bot link (Telegram); RUB 2-day local methods (RF bank card, SBP, SberPay, YooMoney); RUB/USD/EUR Credit Card to Stripe + Link; month/year BTC crypto; every crypto currency in RUB month |
| `personal.freevpnplanet.com` | RUB SBP to kassa.ai; RUB/EUR Credit Card to Stripe; RUB/EUR monthly BTC crypto |

## Test IDs Reference

### `checkout_matrix.e2e.ts` — FreeVPNPlanet Sign Up
- `TC_FVPN_SIGNUP_CARD_001` — Credit Card → Stripe + Link
- `TC_FVPN_SIGNUP_CRYPTO_{CODE}` — 18 crypto currencies → CoinPayments (BTC, BTC_LN, BCH, LTC, DAI, DASH, DOGE, ETC, SHIB, SOL, TRX, TUSD, TUSD_TRC20, USDC, USDT_ERC20, USDT_SOL, USDT_TRC20, XMR)

### `planetconfig_ru.e2e.ts` — PlanetConfig
- `TC_PLANETCONFIG_BOT_001` — Buy via bot → Telegram
- `TC_PLANETCONFIG_RUB_{METHOD}` — RUB 2 days local: RF_BANK_CARD, SBP, SBERPAY, YOOMONEY (4 tests)
- `TC_PLANETCONFIG_RUB_2_DAYS_CREDIT_CARD` — RUB 2 days Credit Card → Stripe + Link
- `TC_PLANETCONFIG_{CUR}_CARD` — RUB/USD/EUR monthly Credit Card → Stripe + Link (3 tests)
- `TC_PLANETCONFIG_{CUR}_{PLAN}_CRYPTO_BTC` — CUR × PLAN crypto BTC → CoinPayments (3 currencies × 2 plans = 6 tests)
- `TC_PLANETCONFIG_CRYPTO_NETWORK_{CODE}` — Every crypto network RUB month → CoinPayments (18 tests)

### `personal_vpn_en.e2e.ts` — Personal FreeVPNPlanet
- `TC_PERSONAL_RUB_SBP` — RUB monthly SBP → kassa.ai
- `TC_PERSONAL_{CUR}_CARD` — RUB/EUR monthly Credit Card → Stripe (2 tests)
- `TC_PERSONAL_{CUR}_MONTHLY_CRYPTO_BTC` — RUB/EUR monthly BTC → CoinPayments (2 tests)

### `payment_contract.e2e.ts` — API
- `API_001` — Public funnel pages return non-5xx statuses
- `API_002` — Allowed provider host list validation

## Assumptions

- Tests verify checkout handoff, not successful payment.
- Payment provider assertions are URL/host based.
- Unique emails are generated per run.
- Crypto should be selected before accepting terms where the UI can otherwise keep the previous card selection.