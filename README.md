# Free VPN Planet Playwright E2E

[![Playwright E2E](https://github.com/grigoryev-evg/free-vpn-planet-qa-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/grigoryev-evg/free-vpn-planet-qa-tests/actions/workflows/playwright.yml)

Playwright E2E project for the QA assignment around:

- Sign Up checkout flow on `freevpnplanet.com`
- Personal VPN purchase flow on `planetconfig.com` (RU)
- Personal VPN purchase flow on `personal.freevpnplanet.com` (EN)

## Stack

- Playwright Test
- TypeScript
- HTML + JUnit reports
- GitHub Actions CI
- GitHub Pages report publishing
- TC-based scenario structure under `tests-e2e`

## Quick start

```bash
npm ci
npx playwright install chromium
cp .env.example .env
npm test
```

## NPM scripts

- `npm test` - run the full E2E suite
- `npm run test:assignment` - run assignment-critical checkout scenarios
- `npm run test:smoke` - run smoke-marked scenarios
- `npm run test:e2e-ui` - run the full UI suite
- `npm run test:e2e-api` - run API and checkout contract tests
- `npm run test:signup` - run Sign Up scenarios only
- `npm run test:personal-ru` - run RU dedicated VPN scenarios only
- `npm run test:personal-en` - run EN dedicated VPN scenarios only
- `npm run test:headed` - run all tests in headed mode
- `npm run test:list` - list discovered tests
- `npm run typecheck` - run TypeScript checks
- `npm run report` - open the HTML report

## Project structure

- [`tests-e2e/features`](tests-e2e/features) - feature summaries
- [`tests-e2e/tests/specs`](tests-e2e/tests/specs) - TC-based E2E specs
- [`tests-e2e/tests/browser/pages`](tests-e2e/tests/browser/pages) - split page objects
- [`tests-e2e/tests/browser/helpers`](tests-e2e/tests/browser/helpers) - cookie, storage, and UI helpers
- [`tests-e2e/data`](tests-e2e/data) - users, plans, and payment methods
- [`tests-e2e/utils`](tests-e2e/utils) - scenario utilities
- [`playwright.config.ts`](playwright.config.ts) - Playwright configuration
- [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) - GitHub Actions pipeline
- [`docs/recommendations-template.md`](docs/recommendations-template.md) - template for the companion document

## E2E coverage

The assignment-critical suite is tagged with `@assignment` and validates the user journey up to the hosted payment provider. These tests intentionally assert the checkout hand-off: if the live product does not create/open a valid payment page, the test fails.

| Area | Test cases | What is covered |
|---|---|---|
| Sign Up checkout | `TC_SIGNUP_001` | Opens `freevpnplanet.com`, navigates through `Log In -> Sign Up`, fills a fresh user, selects card payment, accepts terms, submits `Get your subscription`, and verifies that the browser reaches an allowed hosted payment provider. |
| Personal VPN RU | `TC_VPN_RU_001`, `TC_VPN_RU_003` | Opens `planetconfig.com`, selects purchase options, continues to payment method selection, covers card and cryptocurrency payment methods, submits payment, and verifies hosted checkout navigation. |
| Personal VPN EN | `TC_VPN_EN_001`, `TC_VPN_EN_002`, `TC_VPN_EN_003`, `TC_VPN_EN_004` | Opens `personal.freevpnplanet.com`, covers monthly and annual plans, covers card, cryptocurrency, and the default available payment method, submits payment, and verifies hosted checkout navigation. |
| Payment contract sanity | `API_001`, `API_003`, `API_004` | Checks public funnel availability, payment provider allowlist normalization, and that the RU payment step exposes expected payment controls before submit. |

Additional non-assignment scenarios are kept under the same specs to document wider QA coverage:

- Sign Up validation: invalid email, invalid password variants, password mismatch, empty required fields, guarded submit behavior.
- State and recovery: cookies, localStorage/session behavior, expired auth recovery, clean-context behavior.
- UI and modal behavior: loading states, leave-confirmation flows, retry/error modal handling, tooltip/helper visibility.
- Purchase-flow resilience: back/change-plan behavior, failed-payment route handling, currency/plan summary updates.

## Assumptions

- The suite is designed to validate transition into a payment page, not complete a real payment.
- Payment providers can vary by region and environment, so checkout verification is URL- and provider-oriented.
- A fresh email is generated on each run to avoid collisions in sign-up and purchase flows.
- Some validation, modal, and state scenarios are adaptive and rely on runtime availability of the target control in production.

## GitHub Actions

The workflow supports:

- manual runs from `Actions -> Playwright E2E -> Run workflow`
- manual suite choice: `assignment`, `all`, `smoke`, `e2e-ui`, `e2e-api`
- default manual suite: `assignment`

Artifacts published on each run:

- Playwright HTML report
- screenshots, videos and traces on failures
- JUnit XML for CI consumption

The `smoke` job also deploys the HTML report to GitHub Pages, so the run includes a browser-openable report link without downloading artifacts.

## Suite strategy

- `smoke`:
  core assignment coverage with `@smoke` tests
- `assignment`:
  required assignment flows with hosted checkout assertions; expected to fail if the live checkout flow is broken
- `e2e-ui`:
  UI flows, validation, cookies, modals, and state checks
- `e2e-api`:
  lightweight network and checkout contract checks
