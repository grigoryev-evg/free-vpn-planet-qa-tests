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

- [`tests-e2e/features`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests-e2e/features) - feature summaries
- [`tests-e2e/tests/specs`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests-e2e/tests/specs) - TC-based E2E specs
- [`tests-e2e/tests/browser/pages`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests-e2e/tests/browser/pages) - split page objects
- [`tests-e2e/tests/browser/helpers`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests-e2e/tests/browser/helpers) - cookie, storage, and UI helpers
- [`tests-e2e/data`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests-e2e/data) - users, plans, and payment methods
- [`tests-e2e/utils`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests-e2e/utils) - scenario utilities
- [`playwright.config.ts`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/playwright.config.ts) - Playwright configuration
- [`.github/workflows/playwright.yml`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/.github/workflows/playwright.yml) - CI pipeline
- [`docs/recommendations-template.md`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/docs/recommendations-template.md) - template for the companion document

## Assumptions

- The suite is designed to validate transition into a payment page, not complete a real payment.
- Payment providers can vary by region and environment, so checkout verification is URL- and provider-oriented.
- A fresh email is generated on each run to avoid collisions in sign-up and purchase flows.
- Some validation, modal, and state scenarios are adaptive and rely on runtime availability of the target control in production.

## GitHub Actions

The workflow supports:

- automatic runs on `push` and `pull_request`
- manual runs from `Actions -> Playwright E2E -> Run workflow`
- manual suite choice: `all`, `smoke`, `e2e-ui`, `e2e-api`

Artifacts published on each run:

- Playwright HTML report
- screenshots, videos and traces on failures
- JUnit XML for CI consumption

The `smoke` job also deploys the HTML report to GitHub Pages, so the run includes a browser-openable report link without downloading artifacts.

## Suite strategy

- `smoke`:
  core assignment coverage with `@smoke` tests
- `e2e-ui`:
  UI flows, validation, cookies, modals, and state checks
- `e2e-api`:
  lightweight network and checkout contract checks
