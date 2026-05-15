# Free VPN Planet Playwright E2E

Playwright E2E project for the QA assignment around:

- Sign Up checkout flow on `freevpnplanet.com`
- Personal VPN purchase flow on `planetconfig.com` (RU)
- Personal VPN purchase flow on `personal.freevpnplanet.com` (EN)

## Stack

- Playwright Test
- TypeScript
- HTML + JUnit reports
- GitHub Actions CI

## Quick start

```bash
npm ci
npx playwright install chromium
cp .env.example .env
npm test
```

## NPM scripts

- `npm test` - run the full E2E suite
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

## Notes for GitHub

The workflow publishes:

- Playwright HTML report
- screenshots, videos and traces on failures
- JUnit XML for CI consumption

