# Implementation Plan — Checkout Matrix

> **Status: ✅ COMPLETED (2026-05-18)**

---

## Final Specs

| Spec | Tests | Domain |
|---|---|---|
| `checkout_matrix.e2e.ts` | 19 (1 card + 18 crypto) | `freevpnplanet.com` → Sign Up → payment pages |
| `planetconfig_ru.e2e.ts` | 32 | `planetconfig.com` — bot, RUB local, card, crypto BTC, crypto networks |
| `personal_vpn_en.e2e.ts` | 6 | `personal.freevpnplanet.com` — card, SBP, crypto BTC |
| `payment_contract.e2e.ts` | 2 | API health checks |

**Total: 59 unique tests in 4 spec files (177 total across 3 browsers).**

---

## Original tasks — all completed

### Task 1 — Data layer ✅
- [x] `tests-e2e/data/plans.ts` — added `two_days`
- [x] `tests-e2e/data/payment_methods.ts` — extended types, added `qr.nspk.ru` and all CoinPayments hosts

### Task 2 — POM: PlanSelectionPage ✅
- [x] `selectTwoDaysPlan()`
- [x] `clickBuyViaBot()` + `expectBotLinkOpened()`
- [x] `2_days` support in `fillRequiredDefaults()`

### Task 3 — POM: PaymentMethodPage ✅
- [x] `selectSbp()`, `selectSberPay()`, `selectYooMoney()`, `selectRfBankCard()`
- [x] `selectCryptoCurrency(name: string, code?: string)`
- [x] `expectSubmitButtonEnabled()`

### Task 4 — POM: PaymentPage + SignupPage ✅
- [x] `expectYooMoneyCheckout()` / `expectHost()`
- [x] `expectStripeCheckout()`, `clickLinkAndExpectLinkCheckout()`
- [x] `expectCoinPaymentsCheckout()`, `expectWalletAddressOrQr()`, `expectCoinPaymentsCurrency()`
- [x] SignUp: `submitPayment()`

### Task 5 — Spec: checkout_matrix.e2e.ts ✅
- [x] Card → Stripe + Link (`TC_FVPN_SIGNUP_CARD_001`)
- [x] ALL 18 crypto currencies → CoinPayments (`TC_FVPN_SIGNUP_CRYPTO_{CODE}`)

### Task 6 — Spec: planetconfig_ru.e2e.ts ✅
- [x] Bot → Telegram (`TC_PLANETCONFIG_BOT_001`)
- [x] RUB 2 days local (4 methods)
- [x] RUB 2 days Credit Card
- [x] RUB/USD/EUR month Credit Card (3)
- [x] RUB/USD/EUR month/year BTC crypto (6)
- [x] Every crypto network RUB month (18)

### Task 7 — Spec: personal_vpn_en.e2e.ts ✅
- [x] RUB SBP → kassa.ai
- [x] RUB/EUR Credit Card → Stripe (2)
- [x] RUB/EUR BTC crypto → CoinPayments (2)

### Task 8 — Docs + features ✅
- [x] `tests-e2e/features/signup.feature`
- [x] `tests-e2e/features/personal_vpn_en.feature`
- [x] `tests-e2e/features/personal_vpn_ru.feature`
- [x] `docs/test-coverage-matrix.md`
- [x] `docs/e2e-scenarios.md`
- [x] `README.md`