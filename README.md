# Free VPN Planet Playwright E2E

[![Playwright E2E](https://github.com/grigoryev-evg/free-vpn-planet-qa-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/grigoryev-evg/free-vpn-planet-qa-tests/actions/workflows/playwright.yml)

Playwright E2E test suite covering the Free VPN Planet checkout funnel across three environments:

- Sign Up checkout on `freevpnplanet.com`
- Personal VPN RU purchase flow on `planetconfig.com`
- Personal VPN EN purchase flow on `personal.freevpnplanet.com`

**40 test cases × 3 browsers (chromium, firefox, webkit) = 120 runs total.**

## Stack

- Playwright Test + TypeScript (strict)
- HTML + JUnit reports
- GitHub Actions CI with GitHub Pages report publishing
- Page Object Model + data-driven test structure

## Quick start

```bash
npm ci
npx playwright install chromium
cp .env.example .env
npm test
```

## NPM scripts

| Script | Description |
|---|---|
| `npm test` | Full E2E suite (all 40 tests × 3 browsers) |
| `npm run test:assignment` | Assignment-critical checkout scenarios (`@assignment`, 8 tests) |
| `npm run test:smoke` | Smoke-tagged critical path (`@smoke`) |
| `npm run test:e2e-ui` | UI flow tests (validation, cookies, modals, state) |
| `npm run test:e2e-api` | API and checkout contract tests |
| `npm run test:signup` | Sign Up scenarios only |
| `npm run test:personal-ru` | RU dedicated VPN scenarios only |
| `npm run test:personal-en` | EN dedicated VPN scenarios only |
| `npm run test:headed` | All tests in headed mode |
| `npm run test:list` | List discovered tests |
| `npm run typecheck` | TypeScript type checking |
| `npm run report` | Open the HTML report |

## Project structure

| Directory | Purpose |
|---|---|
| `tests-e2e/features/` | Feature summaries (Gherkin) |
| `tests-e2e/tests/specs/` | E2E spec files (Playwright tests) |
| `tests-e2e/tests/browser/pages/` | Page Object Models |
| `tests-e2e/tests/browser/helpers/` | Cookie, storage, and UI utilities |
| `tests-e2e/data/` | Test data: users, plans, payment methods |
| `tests-e2e/utils/` | Shared utilities and scenario runner |
| `playwright.config.ts` | Playwright configuration (projects, workers, timeouts) |
| `.github/workflows/playwright.yml` | CI/CD pipeline |
| `docs/` | Findings, recommendations, coverage matrix |

## Test breakdown

### Spec files (40 tests total)

| Spec | Tests | Coverage |
|---|---|---|
| `signup.e2e.ts` | 15 | Signup flow, validation, cookies, UI states, modals |
| `personal_vpn_ru.e2e.ts` | 13 | RU purchase flow, payment methods, cookies, UI, modals |
| `personal_vpn_en.e2e.ts` | 9 | EN purchase flow, payment methods, cookies, UI, modal |
| `payment_contract.e2e.ts` | 3 | API health checks, provider allowlist, payment controls |

### Assignment coverage (8 tests, `@assignment` tag)

| Test ID | Scenario |
|---|---|
| TC_SIGNUP_001 | Signup + card → hosted checkout |
| TC_SIGNUP_002 | Signup + default payment → hosted checkout |
| TC_VPN_RU_001 | RU monthly + card → hosted checkout |
| TC_VPN_RU_002 | RU yearly + card → hosted checkout |
| TC_VPN_RU_003 | RU monthly + crypto → hosted checkout |
| TC_VPN_EN_001 | EN monthly + card → hosted checkout |
| TC_VPN_EN_002 | EN yearly + card → hosted checkout |
| TC_VPN_EN_003 | EN monthly + crypto → hosted checkout |

### Tags reference

| Tag | Meaning |
|---|---|
| `@assignment` | Minimal required set for the QA assignment (8 positive E2E scenarios) |
| `@smoke` | Critical path subset of assignment |
| `@api` | HTTP-level test (no browser UI) |
| `@regression` | Covers a regression bug or edge case |
| `@cookie` | Cookie-dependent behaviour |
| `@modal` | Modal dialog behaviour |
| `@slow` | Runtime > 30s |

## GitHub Actions

Manual trigger: `Actions → Playwright E2E → Run workflow`

Suite options: `assignment` (default), `all`

Artifacts on each run:
- Playwright HTML report
- Screenshots, videos, and traces on failure

The report is automatically deployed to GitHub Pages.

## Assumptions

- The suite validates the transition into a hosted payment page, not completing a real payment.
- Payment providers vary by region/environment → checkout verification is URL-based and provider-oriented.
- A fresh unique email is generated per test run to avoid collisions.
- Some validation, modal, and state scenarios adapt at runtime based on control availability in production.
- All URLs and configuration come from `.env` variables — no hardcoded values.

## Suite strategy

| Suite | Scope |
|---|---|
| `assignment` | 8 positive checkout E2E scenarios; expected to fail if live checkout is broken |
| `smoke` | Core assignment subset with `@smoke` tag |
| `e2e-ui` | UI flows: validation, cookies, modals, state transitions |
| `e2e-api` | Lightweight API and checkout contract checks |