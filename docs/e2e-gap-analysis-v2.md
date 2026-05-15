# E2E Gap Analysis Against `PROMPT_FOR_CODESPACES_E2E_V2.md`

## 1. Current project vs requested target

### Current structure

```text
tests/
  auth-signup.spec.ts
  personal-vpn-ru.spec.ts
  personal-vpn-en.spec.ts
  known-issues.spec.ts

src/pages/
  home.page.ts
  account.page.ts
  dedicated-vpn.page.ts

src/config/
  env.ts
  test-data.ts

src/utils/
  test-data-factory.ts
```

### Requested target structure

```text
tests-e2e/
  features/
  tests/browser/pages/
  tests/browser/helpers/
  tests/specs/
  data/
  utils/
```

### Gap summary

- The repo already uses Playwright + TypeScript and page objects.
- The repo does not yet follow the requested `tests-e2e/...` layout.
- Current page objects are too coarse:
  - `AccountPage` mixes sign-up form, payment method step, terms, submit, and checkout assertions.
  - `DedicatedVpnPage` mixes plan selection, email step, payment method step, crypto selection, terms, and checkout assertions.
- There are no dedicated cookie/storage helpers.
- There are no dedicated UI-state helpers.
- There is no scenario runner abstraction.
- There is no feature-level decomposition by `Sign Up`, `VPN RU`, `VPN EN`.

## 2. Config and infrastructure gaps

### `playwright.config.ts`

Current config is close, but does not fully match the prompt:

- `trace: "retain-on-failure"`: already correct.
- `video: "retain-on-failure"`: already correct.
- `screenshot: "only-on-failure"`: should be changed to `retain-on-failure` if strict prompt compliance is required.
- Browsers:
  - only `chromium` is configured,
  - `firefox` and `webkit` are missing.

### Test evidence and debugging

Missing today:

- explicit step comments per scenario for trace analysis,
- scenario-level logging helpers,
- request capture for `/api/signup`, `/api/payment`, `/checkout`,
- helpers for cookie/localStorage/sessionStorage state setup,
- helpers for modal/confirm-dialog assertions.

## 3. Current test coverage mapped to requested TC IDs

## 3.1 Sign Up

| TC ID | Status | Current evidence | Gap |
|---|---|---|---|
| `TC_SIGNUP_001` | partial | `tests/auth-signup.spec.ts`, `tests/known-issues.spec.ts` | Payment step is reached, card submit exists as expected failure, but the requested happy-path is not part of the main suite and does not assert a stable success redirect |
| `TC_SIGNUP_002` | missing | payment methods visibility only | No crypto submit test |
| `TC_SIGNUP_003` | missing | none | No existing-email scenario |
| `TC_SIGNUP_004` | missing | none | No invalid-email validation |
| `TC_SIGNUP_005` | missing | none | No password validation coverage |
| `TC_SIGNUP_006` | missing | none | No confirm-password mismatch coverage |
| `TC_SIGNUP_007` | missing | none | No empty-fields coverage |
| `TC_SIGNUP_008` | missing | none | No guarded submit test before required fields are valid |
| `TC_SIGNUP_COOKIES_001` | missing | none | No cookie-backed prefill/state restoration |
| `TC_SIGNUP_COOKIES_002` | missing | none | No empty-storage validation |
| `TC_SIGNUP_COOKIES_003` | missing | none | No expired-session redirect check |
| `TC_SIGNUP_UI_001` | missing | none | No button enabled/disabled assertions |
| `TC_SIGNUP_UI_002` | missing | none | No loading-state assertions |
| `TC_SIGNUP_MODAL_001` | missing | none | No leave-form confirmation coverage |
| `TC_SIGNUP_MODAL_002` | missing | none | No error-modal coverage |

## 3.2 Personal VPN RU

| TC ID | Status | Current evidence | Gap |
|---|---|---|---|
| `TC_VPN_RU_001` | partial | `tests/personal-vpn-ru.spec.ts`, `tests/known-issues.spec.ts` | Month flow reaches payment method page; card submit exists only as expected failure |
| `TC_VPN_RU_002` | missing | none | No annual card scenario |
| `TC_VPN_RU_003` | partial | `tests/personal-vpn-ru.spec.ts` | Crypto option visibility exists, but not crypto submit to checkout |
| `TC_VPN_RU_004` | missing | none | No annual crypto scenario |
| `TC_VPN_RU_005` | missing | none | No cancel/back-before-payment coverage |
| `TC_VPN_RU_006` | missing | none | No declined/failed payment scenario |
| `TC_VPN_RU_007` | missing | none | No plan-change-on-payment-page scenario |
| `TC_VPN_RU_COOKIES_001` | missing | none | No retained selections coverage |
| `TC_VPN_RU_COOKIES_002` | missing | none | No clean UI state after cookie reset |
| `TC_VPN_RU_COOKIES_003` | missing | none | No isolated `localStorage` check |
| `TC_VPN_RU_UI_001` | missing | none | No plan switch price/state assertions |
| `TC_VPN_RU_UI_002` | missing | none | No wizard/progress step assertions |
| `TC_VPN_RU_MODAL_001` | missing | none | No confirm-dialog when changing plan from payment page |

## 3.3 Personal VPN EN

| TC ID | Status | Current evidence | Gap |
|---|---|---|---|
| `TC_VPN_EN_001` | partial | `tests/personal-vpn-en.spec.ts`, `tests/known-issues.spec.ts` | Month card flow reaches payment method page; submit exists only as expected failure |
| `TC_VPN_EN_002` | partial | `tests/personal-vpn-en.spec.ts` | Year card flow reaches payment method page but does not submit |
| `TC_VPN_EN_003` | missing | none | No PayPal scenario |
| `TC_VPN_EN_004` | missing | none | No yearly PayPal scenario |
| `TC_VPN_EN_COOKIES_001` | missing | none | No remembered-plan/login coverage |
| `TC_VPN_EN_COOKIES_002` | missing | none | No fresh-state coverage |
| `TC_VPN_EN_UI_001` | missing | none | No language/currency switch assertions |
| `TC_VPN_EN_UI_002` | missing | none | No post-pay loading-state check |
| `TC_VPN_EN_MODAL_001` | missing | none | No tooltip/input-helper coverage |

## 3.4 Cross-cutting prompt requirements

| Requirement | Status | Gap |
|---|---|---|
| Cookies vs no cookies | missing | No storage-state helper layer |
| UI component states | missing | No dedicated assertions for disabled/loading/hover/focus/active |
| Page transitions | partial | Only basic navigation to payment selection is covered |
| Modals / confirm dialogs | missing | No coverage |
| Trace-ready step comments | missing | Existing tests are short and not annotated step-by-step |
| Network/XHR checks | missing | No request interception or assertion layer |
| Cross-browser coverage | missing | `firefox` and `webkit` not configured |

## 4. Partially implemented scenarios and what is missing to finish them

### `TC_SIGNUP_001`

Already present in fragments, but still needs:

- full field coverage, not only email,
- explicit payment-method selection,
- terms confirmation,
- submit in the main happy-path suite,
- assertion that the redirect host belongs to an allowed provider list,
- trace-friendly comments around each user step.

### `TC_VPN_RU_001`

Already present in fragments, but still needs:

- explicit month-plan assertion before submit,
- explicit card selection,
- terms assertion,
- submit in the main suite,
- hosted checkout URL/host assertion.

### `TC_VPN_RU_003`

Already present only up to crypto option visibility. It still needs:

- cryptocurrency selection,
- submit,
- checkout page assertion,
- optional provider-host assertion.

### `TC_VPN_EN_001`

Already present in fragments, but still needs:

- card selection,
- terms assertion,
- submit as standard E2E rather than `test.fail`,
- redirect assertion.

### `TC_VPN_EN_002`

Already reaches payment method selection, but still needs:

- payment method selection,
- terms assertion,
- submit,
- checkout assertion.

## 5. Recommended refactor before adding the missing tests

### Proposed page objects

- `signup.page.ts`
  - landing to sign-up flow
  - credentials form
  - button/error/loading state assertions
- `plan_selection.page.ts`
  - RU/EN plan, location, currency step
  - wizard/progress assertions
- `payment_method.page.ts`
  - card/crypto/PayPal selection
  - terms
  - submit button state
  - modal handling
- `payment_page.page.ts`
  - hosted checkout host/title/URL assertions
  - failed-payment assertions

### Proposed helpers

- `helpers/cookies.ts`
  - seed cookies
  - clear cookies
  - expire auth cookie
- `helpers/storage.ts`
  - clear local/session storage
  - seed local/session storage
  - open context with custom storage state
- `helpers/ui_state.ts`
  - assert disabled/enabled/loading
  - assert active plan/payment method
  - assert wizard step state

### Structural migration

Suggested path:

1. Keep existing `src/pages` as the first migration source.
2. Split `AccountPage` into `SignupPage` + `PaymentMethodPage`.
3. Split `DedicatedVpnPage` into `PlanSelectionPage` + `PaymentMethodPage` + `PaymentPage`.
4. Move specs into `tests-e2e/tests/specs`.
5. Move reusable scenario data into `tests-e2e/data`.

## 6. Missing scenario drafts: flow + Playwright test proposal

All snippets below assume the refactored structure:

```ts
import { expect, test } from "@playwright/test";
import { SignupPage } from "../browser/pages/signup.page";
import { PlanSelectionPage } from "../browser/pages/plan_selection.page";
import { PaymentMethodPage } from "../browser/pages/payment_method.page";
import { PaymentPage } from "../browser/pages/payment_page.page";
import { clearAllStorage, seedLocalStorage } from "../browser/helpers/storage";
import { expireAuthCookie, seedCookies } from "../browser/helpers/cookies";
```

## 6.1 Sign Up missing scenarios

### `TC_SIGNUP_002` - successful signup with cryptocurrency

Flow:

1. Open `https://freevpnplanet.com/`.
2. Go through `Log In -> Sign Up`.
3. Fill valid email, password, confirm password.
4. Move to payment step.
5. Select crypto.
6. Accept terms.
7. Click `Get your subscription`.
8. Assert checkout/hosted provider page is opened.

```ts
test("TC_SIGNUP_002 - Successful signup with cryptocurrency", async ({ page }) => {
  const signup = new SignupPage(page);
  const payment = new PaymentMethodPage(page);
  const checkout = new PaymentPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({ email: signup.uniqueEmail(), password: "TestPass123!" });
  await signup.continueToPaymentStep();

  await payment.selectCrypto();
  await payment.acceptTerms();
  await payment.submitSubscription();

  await checkout.expectHostedProvider(["checkout.stripe.com", "paymentt.kassa.ai"]);
});
```

### `TC_SIGNUP_003` - existing email UX

Flow:

1. Open sign-up flow.
2. Fill an already registered email.
3. Fill valid password and confirmation.
4. Continue.
5. Assert one of the expected UX results:
   - inline error for existing email, or
   - redirect to login/account recovery, or
   - explicit suggestion to log in.
6. Assert no checkout page opens.

```ts
test("TC_SIGNUP_003 - Existing email shows controlled UX", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({ email: "existing-user@example.com", password: "TestPass123!" });
  await signup.continueToPaymentStep();

  await signup.expectExistingEmailUx();
  await signup.expectNoCheckoutRedirect();
});
```

### `TC_SIGNUP_004` - invalid email

Flow:

1. Open sign-up flow.
2. Enter invalid email.
3. Enter valid password and confirmation.
4. Try to continue.
5. Assert inline email validation.
6. Assert payment step is not opened.

```ts
test("TC_SIGNUP_004 - Invalid email blocks signup", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({ email: "invalid-email", password: "TestPass123!" });
  await signup.continueToPaymentStep();

  await signup.expectEmailValidationError();
  await signup.expectStillOnCredentialsStep();
});
```

### `TC_SIGNUP_005` - invalid password variants

Flow:

1. Open sign-up flow.
2. Repeat the form with several invalid passwords.
3. Assert password-policy error for each variant.
4. Assert no move to payment step.

```ts
test("TC_SIGNUP_005 - Invalid password policy is enforced", async ({ page }) => {
  const signup = new SignupPage(page);
  const invalidPasswords = ["short", "lowercase123", "NoDigitsOnly"];

  await signup.open();
  await signup.openSignUpFromLanding();

  for (const password of invalidPasswords) {
    await signup.fillCredentials({ email: signup.uniqueEmail(), password, confirmPassword: password });
    await signup.continueToPaymentStep();
    await signup.expectPasswordValidationError();
    await signup.resetCredentialsStep();
  }
});
```

### `TC_SIGNUP_006` - password confirmation mismatch

Flow:

1. Open sign-up flow.
2. Enter valid email.
3. Enter password and a different confirmation.
4. Try to continue.
5. Assert mismatch error.
6. Assert no move to payment step.

```ts
test("TC_SIGNUP_006 - Password confirmation mismatch", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({
    email: signup.uniqueEmail(),
    password: "TestPass123!",
    confirmPassword: "Mismatch123!"
  });
  await signup.continueToPaymentStep();

  await signup.expectPasswordMismatchError();
  await signup.expectStillOnCredentialsStep();
});
```

### `TC_SIGNUP_007` - empty fields

Flow:

1. Open sign-up flow.
2. Leave required fields empty.
3. Attempt to continue.
4. Assert validation state for required fields.
5. Assert no payment step.

```ts
test("TC_SIGNUP_007 - Empty required fields are blocked", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.continueToPaymentStep();

  await signup.expectRequiredFieldErrors();
  await signup.expectStillOnCredentialsStep();
});
```

### `TC_SIGNUP_008` - guarded submit before required fields

Flow:

1. Open sign-up flow.
2. Observe submit/next button before data entry.
3. Assert disabled state.
4. Force click attempt if needed.
5. Assert no request and no transition.

```ts
test("TC_SIGNUP_008 - Submit is guarded before required fields are valid", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();

  await signup.expectNextDisabled();
  await signup.expectNoValidationBypassOnForcedSubmit();
});
```

### `TC_SIGNUP_COOKIES_001` - cookies enabled with prefilled state

Flow:

1. Seed cookies/storage for a returning user.
2. Open sign-up flow.
3. Assert prefetched or prefilled fields are present.
4. Assert UI reflects remembered state.

```ts
test("TC_SIGNUP_COOKIES_001 - Returning user sees prefetched signup state", async ({ context, page }) => {
  const signup = new SignupPage(page);

  await seedCookies(context, [{ name: "signup_hint", value: "1" }]);
  await seedLocalStorage(page, { signupEmail: "saved@example.com" });
  await signup.open();
  await signup.openSignUpFromLanding();

  await signup.expectPrefilledEmail("saved@example.com");
  await signup.expectReturningUserUiState();
});
```

### `TC_SIGNUP_COOKIES_002` - clean context without cookies

Flow:

1. Clear cookies and storage.
2. Open sign-up flow.
3. Assert form is empty.
4. Assert no remembered UI state.

```ts
test("TC_SIGNUP_COOKIES_002 - Clean context shows empty signup form", async ({ context, page }) => {
  const signup = new SignupPage(page);

  await context.clearCookies();
  await clearAllStorage(page);
  await signup.open();
  await signup.openSignUpFromLanding();

  await signup.expectEmptyCredentialsForm();
  await signup.expectFreshUiState();
});
```

### `TC_SIGNUP_COOKIES_003` - expired session

Flow:

1. Reach authenticated or semi-authenticated payment step.
2. Expire `_auth`.
3. Retry protected checkout action.
4. Assert redirect to login/sign-up.
5. Assert protected checkout does not open.

```ts
test("TC_SIGNUP_COOKIES_003 - Expired auth returns user to login/signup", async ({ context, page }) => {
  const signup = new SignupPage(page);
  const payment = new PaymentMethodPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({ email: signup.uniqueEmail(), password: "TestPass123!" });
  await signup.continueToPaymentStep();
  await expireAuthCookie(context, "_auth");

  await payment.selectCard();
  await payment.acceptTerms();
  await payment.submitSubscription();

  await signup.expectAuthRecoveryScreen();
});
```

### `TC_SIGNUP_UI_001` - submit button state

```ts
test("TC_SIGNUP_UI_001 - Signup CTA changes from disabled to enabled", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.expectNextDisabled();
  await signup.fillCredentials({ email: signup.uniqueEmail(), password: "TestPass123!" });
  await signup.expectNextEnabled();
});
```

### `TC_SIGNUP_UI_002` - loading state

```ts
test("TC_SIGNUP_UI_002 - Signup submit shows loading state", async ({ page }) => {
  const signup = new SignupPage(page);
  const payment = new PaymentMethodPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({ email: signup.uniqueEmail(), password: "TestPass123!" });
  await signup.continueToPaymentStep();
  await payment.selectCard();
  await payment.acceptTerms();

  await payment.clickSubmitAndExpectLoadingState();
  await payment.expectLoadingLabel();
});
```

### `TC_SIGNUP_MODAL_001` - leave-form confirmation

```ts
test("TC_SIGNUP_MODAL_001 - Leaving a dirty signup form opens confirmation modal", async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillEmailOnly(signup.uniqueEmail());
  await signup.tryToLeaveDirtyForm();

  await signup.expectLeaveConfirmationModal();
  await signup.cancelLeaveAndExpectFormPreserved();
  await signup.confirmLeaveAndExpectLandingOrLogin();
});
```

### `TC_SIGNUP_MODAL_002` - error modal

```ts
test("TC_SIGNUP_MODAL_002 - Retryable signup error is shown in modal", async ({ page }) => {
  const signup = new SignupPage(page);
  const payment = new PaymentMethodPage(page);

  await signup.open();
  await signup.openSignUpFromLanding();
  await signup.fillCredentials({ email: signup.uniqueEmail(), password: "TestPass123!" });
  await signup.continueToPaymentStep();
  await payment.mockCheckoutFailure();
  await payment.selectCard();
  await payment.acceptTerms();
  await payment.submitSubscription();

  await payment.expectRetryErrorModal();
  await payment.closeErrorModal();
});
```

## 6.2 Personal VPN RU missing scenarios

### `TC_VPN_RU_002` - annual plan + card

```ts
test("TC_VPN_RU_002 - RU annual plan with bank card", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");
  const payment = new PaymentMethodPage(page);
  const checkout = new PaymentPage(page);

  await plan.openRu();
  await plan.selectLocation("Netherlands");
  await plan.selectCurrency("RUB");
  await plan.selectPlan("1 year");
  await plan.fillEmail(plan.uniqueEmail());
  await plan.continueToPaymentMethods();

  await payment.selectRuBankCard();
  await payment.acceptTerms();
  await payment.submitPayment();

  await checkout.expectHostedProvider(["yoomoney.ru", "checkout.stripe.com", "paymentt.kassa.ai"]);
});
```

### `TC_VPN_RU_004` - annual plan + crypto

```ts
test("TC_VPN_RU_004 - RU annual plan with cryptocurrency", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");
  const payment = new PaymentMethodPage(page);
  const checkout = new PaymentPage(page);

  await plan.openRu();
  await plan.selectLocation("Netherlands");
  await plan.selectCurrency("RUB");
  await plan.selectPlan("1 year");
  await plan.fillEmail(plan.uniqueEmail());
  await plan.continueToPaymentMethods();

  await payment.selectRuCrypto("BTC");
  await payment.acceptTerms();
  await payment.submitPayment();

  await checkout.expectHostedProvider(["paymentt.kassa.ai", "checkout.stripe.com"]);
});
```

### `TC_VPN_RU_005` - cancel payment

```ts
test("TC_VPN_RU_005 - RU payment can be cancelled before checkout", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");
  const payment = new PaymentMethodPage(page);

  await plan.openRu();
  await plan.fillRequiredRuDefaults();
  await plan.continueToPaymentMethods();

  await payment.goBackFromPaymentStep();
  await plan.expectPlanSelectionStepVisible();
  await plan.expectSelectionsPreserved();
});
```

### `TC_VPN_RU_006` - failed payment

```ts
test("TC_VPN_RU_006 - RU failed payment shows controlled failure UX", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");
  const payment = new PaymentMethodPage(page);
  const checkout = new PaymentPage(page);

  await plan.openRu();
  await plan.fillRequiredRuDefaults();
  await plan.continueToPaymentMethods();
  await payment.mockDeclinedPayment();
  await payment.selectRuBankCard();
  await payment.acceptTerms();
  await payment.submitPayment();

  await checkout.expectFailedPaymentState();
});
```

### `TC_VPN_RU_007` - change plan from payment page

```ts
test("TC_VPN_RU_007 - RU user can change plan from payment page", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");
  const payment = new PaymentMethodPage(page);

  await plan.openRu();
  await plan.fillRequiredRuDefaults();
  await plan.continueToPaymentMethods();
  await payment.triggerChangePlan();
  await payment.confirmPlanChange();

  await plan.expectPlanSelectionStepVisible();
  await plan.selectPlan("1 year");
  await plan.expectUpdatedPriceSummary();
});
```

### `TC_VPN_RU_COOKIES_001` - remembered selections

```ts
test("TC_VPN_RU_COOKIES_001 - RU cookies restore last selections", async ({ context, page }) => {
  const plan = new PlanSelectionPage(page, "ru");

  await seedCookies(context, [{ name: "last_plan", value: "year" }]);
  await seedLocalStorage(page, { vpnRuCurrency: "RUB", vpnRuLocation: "Netherlands" });
  await plan.openRu();

  await plan.expectSelectedPlan("1 year");
  await plan.expectSelectedCurrency("RUB");
  await plan.expectSelectedLocation("Netherlands");
});
```

### `TC_VPN_RU_COOKIES_002` - clean state

```ts
test("TC_VPN_RU_COOKIES_002 - RU clean context starts from reset UI", async ({ context, page }) => {
  const plan = new PlanSelectionPage(page, "ru");

  await context.clearCookies();
  await clearAllStorage(page);
  await plan.openRu();

  await plan.expectDefaultRuState();
});
```

### `TC_VPN_RU_COOKIES_003` - localStorage isolation

```ts
test("TC_VPN_RU_COOKIES_003 - RU flow remains correct with localStorage only", async ({ context, page }) => {
  const plan = new PlanSelectionPage(page, "ru");

  await context.clearCookies();
  await seedLocalStorage(page, { vpnRuLocation: "Netherlands" });
  await plan.openRu();

  await plan.expectFlowUsableWithLocalStorageOnly();
});
```

### `TC_VPN_RU_UI_001` - plan switch updates price

```ts
test("TC_VPN_RU_UI_001 - RU plan switch updates active state and price", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");

  await plan.openRu();
  await plan.captureCurrentSummary();
  await plan.selectPlan("1 year");

  await plan.expectPlanActive("1 year");
  await plan.expectSummaryChanged();
});
```

### `TC_VPN_RU_UI_002` - wizard state

```ts
test("TC_VPN_RU_UI_002 - RU wizard blocks payment step before required data", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");

  await plan.openRu();
  await plan.expectWizardStepActive("configuration");
  await plan.expectCannotOpenPaymentStepDirectly();
});
```

### `TC_VPN_RU_MODAL_001` - confirm dialog on plan change

```ts
test("TC_VPN_RU_MODAL_001 - RU changing plan from payment page requires confirmation", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "ru");
  const payment = new PaymentMethodPage(page);

  await plan.openRu();
  await plan.fillRequiredRuDefaults();
  await plan.continueToPaymentMethods();
  await payment.triggerChangePlan();

  await payment.expectConfirmDialog();
  await payment.cancelPlanChangeAndStayOnPayment();
  await payment.confirmPlanChangeAndReturnToPlanStep();
});
```

## 6.3 Personal VPN EN missing scenarios

### `TC_VPN_EN_003` - monthly + PayPal

```ts
test("TC_VPN_EN_003 - EN monthly plan with PayPal", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "en");
  const payment = new PaymentMethodPage(page);
  const checkout = new PaymentPage(page);

  await plan.openEn();
  await plan.fillRequiredEnDefaults({ plan: "1 month" });
  await plan.continueToPaymentMethods();
  await payment.selectPayPal();
  await payment.acceptTerms();
  await payment.submitPayment();

  await checkout.expectHostedProvider(["paypal.com", "checkout.stripe.com"]);
});
```

### `TC_VPN_EN_004` - annual + PayPal

```ts
test("TC_VPN_EN_004 - EN annual plan with PayPal", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "en");
  const payment = new PaymentMethodPage(page);
  const checkout = new PaymentPage(page);

  await plan.openEn();
  await plan.fillRequiredEnDefaults({ plan: "1 year" });
  await plan.continueToPaymentMethods();
  await payment.selectPayPal();
  await payment.acceptTerms();
  await payment.submitPayment();

  await checkout.expectHostedProvider(["paypal.com", "checkout.stripe.com"]);
});
```

### `TC_VPN_EN_COOKIES_001` - remembered login/plan

```ts
test("TC_VPN_EN_COOKIES_001 - EN cookies restore previous plan state", async ({ context, page }) => {
  const plan = new PlanSelectionPage(page, "en");

  await seedCookies(context, [{ name: "last_plan", value: "month" }]);
  await seedLocalStorage(page, { vpnEnCurrency: "USD", vpnEnPlan: "1 month" });
  await plan.openEn();

  await plan.expectSelectedPlan("1 month");
  await plan.expectSelectedCurrency("USD");
});
```

### `TC_VPN_EN_COOKIES_002` - fresh state

```ts
test("TC_VPN_EN_COOKIES_002 - EN clean context starts from fresh UI", async ({ context, page }) => {
  const plan = new PlanSelectionPage(page, "en");

  await context.clearCookies();
  await clearAllStorage(page);
  await plan.openEn();

  await plan.expectDefaultEnState();
});
```

### `TC_VPN_EN_UI_001` - language/currency switch

```ts
test("TC_VPN_EN_UI_001 - EN currency or language switch updates UI consistently", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "en");

  await plan.openEn();
  await plan.switchCurrency("EUR");
  await plan.expectCurrency("EUR");
  await plan.expectSummaryChanged();
});
```

### `TC_VPN_EN_UI_002` - loading state after Pay

```ts
test("TC_VPN_EN_UI_002 - EN pay action shows loading state", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "en");
  const payment = new PaymentMethodPage(page);

  await plan.openEn();
  await plan.fillRequiredEnDefaults({ plan: "1 month" });
  await plan.continueToPaymentMethods();
  await payment.selectEnBankCard();
  await payment.acceptTerms();

  await payment.clickSubmitAndExpectLoadingState();
  await payment.expectLoadingLabel();
});
```

### `TC_VPN_EN_MODAL_001` - tooltip/input helper

```ts
test("TC_VPN_EN_MODAL_001 - EN input helper tooltip is shown and dismissed correctly", async ({ page }) => {
  const plan = new PlanSelectionPage(page, "en");

  await plan.openEn();
  await plan.focusEmailFieldHelpIcon();
  await plan.expectEmailTooltipVisible();
  await plan.dismissEmailTooltip();
  await plan.expectEmailTooltipHidden();
});
```

## 7. Priority implementation order

### P0 to satisfy the assignment more directly

1. Finish partial happy-path tests:
   - `TC_SIGNUP_001`
   - `TC_VPN_RU_001`
   - `TC_VPN_RU_003`
   - `TC_VPN_EN_001`
   - `TC_VPN_EN_002`
2. Add missing happy-path tests:
   - `TC_SIGNUP_002`
   - `TC_VPN_RU_002`
   - `TC_VPN_RU_004`
   - `TC_VPN_EN_003`
   - `TC_VPN_EN_004`
3. Enable `firefox` and `webkit`.

### P1 to meet the "maximum coverage" prompt

1. Sign-up validation set:
   - `TC_SIGNUP_003` ... `TC_SIGNUP_008`
2. Cookies/storage:
   - all `*_COOKIES_*`
3. UI states:
   - all `*_UI_*`
4. Modals:
   - all `*_MODAL_*`

## 8. Concrete migration recommendation

If the goal is to align the repo with the prompt rather than only analyze it, the next change set should be:

1. Move and split page objects into:
   - `tests-e2e/tests/browser/pages/signup.page.ts`
   - `tests-e2e/tests/browser/pages/plan_selection.page.ts`
   - `tests-e2e/tests/browser/pages/payment_method.page.ts`
   - `tests-e2e/tests/browser/pages/payment_page.page.ts`
2. Add helpers:
   - `tests-e2e/tests/browser/helpers/cookies.ts`
   - `tests-e2e/tests/browser/helpers/storage.ts`
   - `tests-e2e/tests/browser/helpers/ui_state.ts`
3. Split specs:
   - `tests-e2e/tests/specs/signup.e2e.ts`
   - `tests-e2e/tests/specs/personal_vpn_ru.e2e.ts`
   - `tests-e2e/tests/specs/personal_vpn_en.e2e.ts`
4. Promote current `known-issues` submit flows into standard E2E scenarios and record failures as product findings instead of suite identity.

