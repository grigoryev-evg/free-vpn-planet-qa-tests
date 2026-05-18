# Test Coverage Matrix

The suite is narrowed to scenarios that reach an internal or external payment page. Old validation, cookie, modal, loading-state, and duplicated checkout tests were removed from the executable suite.

## Active Specs

| Spec | Scope |
|---|---|
| `checkout_matrix.e2e.ts` | `freevpnplanet.com` → Log in → Sign Up → card/crypto payment pages |
| `planetconfig_ru.e2e.ts` | `planetconfig.com` checkout for RUB, USD, EUR and bot handoff |
| `personal_vpn_en.e2e.ts` | `personal.freevpnplanet.com` checkout for RUB/EUR |
| `payment_contract.e2e.ts` | Short API/provider allowlist smoke checks |

## Checkout Coverage

| Domain | Scenario | Expected target |
|---|---|---|
| `freevpnplanet.com` | Credit Card + terms | `checkout.stripe.com`, then Link popup on `checkout.link.com` |
| `freevpnplanet.com` | Every crypto currency in dropdown | `www.coinpayments.net` with wallet address or QR |
| `planetconfig.com` | Buy via bot | Telegram bot link |
| `planetconfig.com` | RUB 2 days + Карты банков РФ | `yoomoney.ru` |
| `planetconfig.com` | RUB 2 days + СБП | `qr.nspk.ru` |
| `planetconfig.com` | RUB 2 days + SberPay | `yoomoney.ru` |
| `planetconfig.com` | RUB 2 days + ЮMoney | `yoomoney.ru` |
| `planetconfig.com` | RUB/USD/EUR monthly + Credit Card | `checkout.stripe.com`, then Link popup on `checkout.link.com` |
| `planetconfig.com` | RUB/USD/EUR month and year + Bitcoin | `www.coinpayments.net` |
| `planetconfig.com` | RUB monthly + every crypto currency in dropdown | `www.coinpayments.net` with wallet address or QR |
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

Chromium list after cleanup: 58 tests in 4 executable spec files.
