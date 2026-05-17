# Test Coverage Matrix — Free VPN Planet QA

> Обновлено: 2026-05-17  
> Фокус: покрытие тестового задания (TEST_ASSIGNMENT.md)

## Requirements → Tests Mapping

| # | Requirement (TEST_ASSIGNMENT) | Test ID(s) | Priority | Status |
|---|-----|------------|----------|--------|
| 1 | Sign Up → Card → Hosted Checkout | `TC_SIGNUP_001` | `@assignment @smoke` | ✅ |
| 2 | Sign Up → Positive UX | `TC_SIGNUP_002` | `@smoke` | ✅ |
| 3 | Personal VPN RU (monthly + card) → hosted checkout | `TC_ASSIGN_RU_monthly_card` | `@assignment @smoke` | ✅ |
| 4 | Personal VPN RU (monthly + crypto) → hosted checkout | `TC_ASSIGN_RU_monthly_crypto` | `@assignment @smoke` | ✅ |
| 5 | Personal VPN EN (monthly + card) → hosted checkout | `TC_ASSIGN_EN_monthly_card` | `@assignment @smoke` | ✅ |
| 6 | Personal VPN EN (monthly + crypto) → hosted checkout | `TC_ASSIGN_EN_monthly_crypto` | `@assignment` | ✅ |
| 7 | Personal VPN RU (yearly + card) → hosted checkout | `TC_ASSIGN_RU_yearly_card` | `@assignment` | ✅ |
| 8 | Personal VPN EN (yearly + card) → hosted checkout | `TC_ASSIGN_EN_yearly_card` | `@assignment` | ✅ |

**Assignment coverage: 8/8 = 100%**

## Beyond Assignment — Extended Coverage

| # | Area | Test ID(s) | Tags | Status |
|---|------|-----------|------|--------|
| 9 | Signup validation — existing email | `TC_SIGNUP_003` | `@regression` | ✅ |
| 10 | Signup validation — invalid email | `TC_SIGNUP_004` | `@regression` | ✅ |
| 11 | Signup validation — password policy | `TC_SIGNUP_005` | `@regression` | ✅ |
| 12 | Signup validation — password mismatch | `TC_SIGNUP_006` | `@regression` | ✅ |
| 13 | Signup validation — empty fields | `TC_SIGNUP_007` | `@regression` | ✅ |
| 14 | Signup validation — button guarding | `TC_SIGNUP_008` | `@regression` | ✅ |
| 15 | Signup cookies — returning user | `TC_SIGNUP_COOKIES_001` | `@cookie` | ✅ |
| 16 | Signup cookies — clean storage | `TC_SIGNUP_COOKIES_002` | `@cookie` | ✅ |
| 17 | Signup cookies — expired auth | `TC_SIGNUP_COOKIES_003` | `@cookie` | ✅ |
| 18 | Signup UI — CTA enable/disable | `TC_SIGNUP_UI_001` | `@regression` | ✅ |
| 19 | Signup UI — loading state | `TC_SIGNUP_UI_002` | `@regression` | ✅ |
| 20 | Signup modals — dirty form | `TC_SIGNUP_MODAL_001` | `@modal` | ✅ |
| 21 | Signup modals — error recovery | `TC_SIGNUP_MODAL_002` | `@modal` | ✅ |
| 22 | Personal VPN RU — plan/currency/payment matrix (×12) | `TC_VPN_RU_001` … `TC_VPN_RU_012` | `@smoke @regression` | ✅ |
| 23 | Personal VPN EN — plan/currency/payment matrix (×12) | `TC_VPN_EN_001` … `TC_VPN_EN_012` | `@regression` | ✅ |
| 24 | Payment contract — API status codes | `API_001` | `@api` | ✅ |
| 25 | Payment contract — provider host validation | `API_002`, `API_003` | `@api` | ✅ |
| 26 | Payment contract — RU payment controls visible | `API_004` | `@api` | ✅ |

## Test Execution Time Estimates

| Suite | # Tests (approx) | Target Time | Notes |
|-------|-----------------|-------------|-------|
| `@assignment` | 7 (1 parametric × 6 + 1 signup) | **3–4 min** | Chromium only, 1 worker |
| `@smoke` | ~14 (assignment + more critical paths) | **4–6 min** | Chromium only, 1 worker |
| `e2e-ui` | ~34 (all UI specs) | **8–12 min** | Chromium, 1 worker |
| `e2e-api` | 4 | **~30 sec** | No browser needed (request fixture) |
| `all` | ~38 (ui + api) | **10–15 min** | 3 browsers, 3 workers |

## Key Design Decisions

1. **`assignment.e2e.ts`** — компактный параметризованный spec с 6 вариантами (RU/EN × monthly/yearly × card/crypto) + заимствование `TC_SIGNUP_001` из signup.e2e.ts.
2. **Один браузер (Chromium) для assignment/smoke** — Firefox и WebKit не добавляют ценности для базового дымового прогона.
3. **`fillRequiredDefaults()`** в `PlanSelectionPage` — один `goto` + заполнение всех полей (локация, валюта, план, email) без лишних навигаций.
4. **Удалены методы-псевдонимы** в `PaymentMethodPage` — `submitPayment()` и `selectPaymentMethod()` вместо `submitSubscription()`, `selectRuBankCard()`, `selectEnBankCard()` и т.д.

## Known Gaps (out of scope for assignment)

| Gap | Reason |
|-----|--------|
| Negative: invalid card number, expired card | Требует реальных платёжных данных на hosted checkout |
| Negative: crypto wallet validation | Hosted checkout не контролируется проектом |
| Load testing | Требуется k6/Artillery, не Playwright |
| Accessibility (a11y) | Можно добавить через `@axe-core/playwright` как `@optional` |