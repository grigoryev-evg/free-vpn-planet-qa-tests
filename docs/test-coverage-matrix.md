# Test Coverage Matrix

The suite is narrowed to scenarios that reach an internal or external payment page. Old validation, cookie, modal, loading-state, and duplicated checkout tests were removed from the executable suite.

## Active Specs

| Spec | Tests | Scope |
|---|---|---|
| `checkout_matrix.e2e.ts` | 19 (1 card + 18 crypto) | `freevpnplanet.com` → Log in → Sign Up → card/crypto payment pages |
| `planetconfig_ru.e2e.ts` | 32 | `planetconfig.com` checkout for bot, RUB local methods, card, crypto BTC (3c×2p), every crypto network |
| `personal_vpn_en.e2e.ts` | 6 | `personal.freevpnplanet.com` checkout for RUB/EUR card, SBP, crypto BTC |
| `payment_contract.e2e.ts` | 2 | API health checks and provider allowlist |

## Checkout Coverage

| Domain | Scenario | Expected target |
|---|---|---|
| `freevpnplanet.com` | Credit Card + terms | `checkout.stripe.com`, then Link popup on `checkout.link.com` |
| `freevpnplanet.com` | Every crypto currency in dropdown (18) | `www.coinpayments.net` with wallet address or QR |
| `planetconfig.com` | Buy via bot | Telegram bot link |
| `planetconfig.com` | RUB 2 days + Карты банков РФ | `yoomoney.ru` |
| `planetconfig.com` | RUB 2 days + СБП | `qr.nspk.ru` |
| `planetconfig.com` | RUB 2 days + SberPay | `yoomoney.ru` |
| `planetconfig.com` | RUB 2 days + ЮMoney | `yoomoney.ru` |
| `planetconfig.com` | RUB 2 days + Credit Card | `checkout.stripe.com`, then Link popup on `checkout.link.com` |
| `planetconfig.com` | RUB/USD/EUR monthly + Credit Card | `checkout.stripe.com`, then Link popup on `checkout.link.com` |
| `planetconfig.com` | RUB/USD/EUR month and year + Bitcoin (6) | `www.coinpayments.net` |
| `planetconfig.com` | RUB monthly + every crypto currency in dropdown (18) | `www.coinpayments.net` with wallet address or QR |
| `personal.freevpnplanet.com` | RUB monthly + СБП | `paymentt.kassa.ai` |
| `personal.freevpnplanet.com` | RUB/EUR monthly + Credit Card | `checkout.stripe.com` |
| `personal.freevpnplanet.com` | RUB/EUR month + Bitcoin | `www.coinpayments.net` |

## Known Product Notes

| Observation | Status |
|---|---|
| On `freevpnplanet.com`, crypto should be selected before accepting terms. If terms are accepted first and crypto is changed later, the flow can still submit card/Stripe. | Documented as odd behavior, not kept as a separate blocking test. |
| On `planetconfig.com`, crypto payment is available for month/year subscriptions, not for the 2-day subscription. | Documented as odd behavior. |
| On `personal.freevpnplanet.com`, yearly RUB/EUR currently exposes only SBP/card or card, while monthly exposes crypto. | Documented as odd behavior; yearly crypto is not an active e2e because no crypto option is available to click. |
| Cancelling hosted payment can show `Something went wrong`. | Documented as odd behavior, out of scope for checkout-handoff tests. |

## Current Size

**59 unique tests in 4 spec files (177 total across 3 browsers: chromium, firefox, webkit).**

## Test ID Reference

### `checkout_matrix.e2e.ts`
- `TC_FVPN_SIGNUP_CARD_001` — Credit Card → Stripe + Link
- `TC_FVPN_SIGNUP_CRYPTO_{CODE}` — 18 crypto currencies → CoinPayments

### `planetconfig_ru.e2e.ts`
- `TC_PLANETCONFIG_BOT_001` — Buy via bot → Telegram
- `TC_PLANETCONFIG_RUB_{METHOD}` — RUB 2 days local (RF_BANK_CARD, SBP, SBERPAY, YOOMONEY)
- `TC_PLANETCONFIG_RUB_2_DAYS_CREDIT_CARD` — RUB 2 days Credit Card → Stripe + Link
- `TC_PLANETCONFIG_{CUR}_CARD` — RUB/USD/EUR monthly Credit Card → Stripe + Link
- `TC_PLANETCONFIG_{CUR}_{PLAN}_CRYPTO_BTC` — 3 currencies × 2 plans BTC → CoinPayments
- `TC_PLANETCONFIG_CRYPTO_NETWORK_{CODE}` — 18 crypto networks RUB month → CoinPayments

### `personal_vpn_en.e2e.ts`
- `TC_PERSONAL_RUB_SBP` — RUB monthly SBP → kassa.ai
- `TC_PERSONAL_{CUR}_CARD` — RUB/EUR monthly Credit Card → Stripe
- `TC_PERSONAL_{CUR}_MONTHLY_CRYPTO_BTC` — RUB/EUR monthly Bitcoin → CoinPayments