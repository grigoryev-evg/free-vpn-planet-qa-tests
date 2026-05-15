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

## Quick start

```bash
npm ci
npx playwright install chromium
cp .env.example .env
npm test
```

## NPM scripts

- `npm test` - run the full E2E suite
- `npm run test:smoke` - run the stable smoke suite
- `npm run test:known-issues` - run expected-failure checkout bug coverage
- `npm run test:signup` - run the Sign Up scenario only
- `npm run test:personal-ru` - run RU dedicated VPN scenarios
- `npm run test:personal-en` - run EN dedicated VPN scenarios
- `npm run test:headed` - run all tests in headed mode
- `npm run report` - open the HTML report

## Project structure

- [`tests`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests) - E2E specs
- [`src/pages`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/src/pages) - page objects
- [`src/utils`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/src/utils) - helpers for selectors and payment assertions
- [`playwright.config.ts`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/playwright.config.ts) - Playwright configuration
- [`.github/workflows/playwright.yml`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/.github/workflows/playwright.yml) - CI pipeline
- [`docs/recommendations-template.md`](/C:/Users/cbz_pc/free-vpn-planet-qa-tests/docs/recommendations-template.md) - template for the companion document

## Assumptions

- The suite is designed to validate transition into a payment page, not complete a real payment.
- Payment providers can vary by region and environment, so checkout verification is URL- and provider-oriented.
- A fresh email is generated on each run to avoid collisions in sign-up and purchase flows.

## GitHub Actions

The workflow supports:

- automatic runs on `push` and `pull_request`
- manual runs from `Actions -> Playwright E2E -> Run workflow`
- manual suite choice: `all`, `smoke`, `known-issues`

Artifacts published on each run:

- Playwright HTML report
- screenshots, videos and traces on failures
- JUnit XML for CI consumption

The `smoke` job also deploys the HTML report to GitHub Pages, so the run includes a browser-openable report link without downloading artifacts.

## Suite strategy

- `smoke`:
  stable assertions for the main assignment steps and currently available payment-method surfaces
- `known-issues`:
  expected-failure tests for checkout redirects that are currently broken in production

This keeps CI green while still documenting real product defects in executable form.
