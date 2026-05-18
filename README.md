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
|---|---:|---|
| `checkout_matrix.e2e.ts` | 19 | FreeVPNPlanet Sign Up card + every crypto currency |
| `planetconfig_ru.e2e.ts` | 32 | PlanetConfig RUB/USD/EUR payment handoffs and bot link |
| `personal_vpn_en.e2e.ts` | 5 | Personal FreeVPNPlanet RUB/EUR payment handoffs |
| `payment_contract.e2e.ts` | 2 | API health checks and provider allowlist |

Chromium list after cleanup: 58 tests in 4 executable spec files.

## Scope

| Domain | Covered payment paths |
|---|---|
| `freevpnplanet.com` | Credit Card to Stripe + Link popup; every crypto currency to CoinPayments |
| `planetconfig.com` | Bot link; RUB local methods; RUB/USD/EUR Credit Card; month/year crypto |
| `personal.freevpnplanet.com` | RUB SBP; RUB/EUR Credit Card; RUB/EUR monthly crypto |

## Assumptions

- Tests verify checkout handoff, not successful payment.
- Payment provider assertions are URL/host based.
- Unique emails are generated per run.
- Crypto should be selected before accepting terms where the UI can otherwise keep the previous card selection.
