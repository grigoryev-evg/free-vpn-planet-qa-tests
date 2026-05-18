# Implementation Plan — Checkout Matrix (Часть 1 + Часть 2)

Дата: 2026-05-18

---

## Часть 1: SignUp freevpnplanet.com → account.freevpnplanet.com/order/

### Новый spec: `tests-e2e/tests/specs/checkout_matrix.e2e.ts`

```
Task 1A: Card → Stripe + Link
  TC_SIGNUP_CARD_001 — card → Stripe → iframe Link → checkout.link.com

Task 1B: ALL Crypto (~18 валют параметризованно)
  TC_SIGNUP_CRYPTO — for each cryptoCurrency:
    → выбираем crypto → конкретную валюту → чекбокс → coinpayments.net → QR/адрес

Task 1C: Strange behavior (regression)
  TC_SIGNUP_BUG_001 — Card → чекбокс → switch to crypto (Litecoin) → документировать
```

---

## Часть 2: planetconfig.com (RU/USD/EUR)

### Три валюты: RUB, USD, EUR. Три плана: 2_days, month, year.

### RUB платёжки:
| Платёжка | Редирект |
|----------|----------|
| Карты банков РФ | yoomoney.ru/.../bankcard + /payment/failed/ |
| СБП | qr.nspk.ru/... |
| SberPay | yoomoney.ru/.../sberpay + QR |
| ЮMoney | yoomoney.ru/.../wallet |
| Credit Card | checkout.stripe.com |
| Crypto | coinpayments.net (только month/year) |

### USD / EUR платёжки:
| Платёжка | Редирект |
|----------|----------|
| Credit Card | checkout.stripe.com |
| Crypto | coinpayments.net (только month/year) |

### Дополнительно:
- Кнопка «Купить через бот» → Telegram-бот

### Новый spec: `tests-e2e/tests/specs/planetconfig_ru.e2e.ts`

Параметризованные варианты:
- RUB: 2_days × (rf_bank_card, sbp, sberpay, yoomoney, card)
- RUB: month × (rf_bank_card, sbp, sberpay, yoomoney, card, crypto)
- RUB: year × (rf_bank_card, sbp, sberpay, yoomoney, card, crypto)
- USD: 2_days × card, month × (card, crypto), year × (card, crypto)
- EUR: 2_days × card, month × (card, crypto), year × (card, crypto)
- Bot: 1 тест

~28 параметризованных тестов

---

## Необходимые изменения в коде

### 1. `tests-e2e/data/plans.ts`
- Добавить `two_days: ['2 дня', '2 дн', '2 days']`

### 2. `tests-e2e/data/payment_methods.ts`
- Расширить `PaymentMethod` тип: добавить `'sbp' | 'sberpay' | 'yoomoney' | 'rf_bank_card'`
- Добавить `'qr.nspk.ru'` в `allowedPaymentHosts`

### 3. `tests-e2e/tests/browser/pages/plan_selection.page.ts`
- `selectTwoDaysPlan()`
- `clickBuyViaBot()` + `expectBotLinkOpened()`
- Поддержка `plan: '2_days'` в `fillRequiredDefaults()`

### 4. `tests-e2e/tests/browser/pages/payment_method.page.ts`
- `selectSbp()`
- `selectSberPay()`
- `selectYooMoney()`
- `selectRfBankCard()`
- `selectCryptoCurrency(name: string)`
- `expectSubmitButtonEnabled()`

### 5. `tests-e2e/tests/browser/pages/payment_page.page.ts`
- `expectNspkQr()`
- `expectYooMoneyCheckout(type)`
- `expectPaymentFailedRedirect()`

### 6. `tests-e2e/tests/browser/pages/signup.page.ts`
- `submitPayment()`
- Расширить flow для всех платёжных методов

---

## @assignment минимальный набор (~12 тестов)

| # | Тест | Сценарий |
|---|------|----------|
| 1 | TC_SIGNUP_CARD_001 | SignUp + Card → Stripe + Link |
| 2 | TC_SIGNUP_CRYPTO_BTC | SignUp + BTC → CoinPayments |
| 3 | TC_PLANET_RUB_2D_RFBANKCARD | RU 2d + Карты банков РФ |
| 4 | TC_PLANET_RUB_2D_SBP | RU 2d + СБП |
| 5 | TC_PLANET_RUB_2D_SBERPAY | RU 2d + SberPay |
| 6 | TC_PLANET_RUB_2D_YOOMONEY | RU 2d + ЮMoney |
| 7 | TC_PLANET_RUB_2D_CARD | RU 2d + Credit Card (Stripe) |
| 8 | TC_PLANET_RUB_MONTH_CARD | RU month + Card |
| 9 | TC_PLANET_RUB_MONTH_CRYPTO | RU month + Crypto |
| 10 | TC_PLANET_USD_2D_CARD | USD 2d + Card |
| 11 | TC_PLANET_EUR_2D_CARD | EUR 2d + Card |
| 12 | TC_PLANET_BOT_001 | «Купить через бот» → Telegram |

---

## Порядок реализации (Tasks)

### Task 1 — Data layer
- [ ] `tests-e2e/data/plans.ts` — добавить `two_days`
- [ ] `tests-e2e/data/payment_methods.ts` — расширить типы, добавить `qr.nspk.ru`

### Task 2 — POM: PlanSelectionPage
- [ ] `selectTwoDaysPlan()`
- [ ] `clickBuyViaBot()` + `expectBotLinkOpened()`
- [ ] Поддержка `2_days` в `fillRequiredDefaults()`

### Task 3 — POM: PaymentMethodPage
- [ ] `selectSbp()`, `selectSberPay()`, `selectYooMoney()`, `selectRfBankCard()`
- [ ] `selectCryptoCurrency(name: string)`
- [ ] `expectSubmitButtonEnabled()`

### Task 4 — POM: PaymentPage + SignupPage
- [ ] `expectNspkQr()`, `expectYooMoneyCheckout()`, `expectPaymentFailedRedirect()`
- [ ] Signup: `submitPayment()`

### Task 5 — Spec: checkout_matrix.e2e.ts (Часть 1)
- [ ] Card → Stripe + Link
- [ ] ALL Crypto
- [ ] Strange behavior

### Task 6 — Spec: planetconfig_ru.e2e.ts (Часть 2)
- [ ] RUB 2_days (5 платёжек)
- [ ] RUB month (6 платёжек)
- [ ] RUB year (6 платёжек)
- [ ] USD (все планы)
- [ ] EUR (все планы)
- [ ] Bot

### Task 7 — Update features + docs
- [ ] `tests-e2e/features/signup.feature`
- [ ] `tests-e2e/features/personal_vpn_ru.feature`
- [ ] `docs/test-coverage-matrix.md`