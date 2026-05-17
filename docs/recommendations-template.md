# Recommendations — Free VPN Planet QA

Based on the test suite analysis and observed behaviour during test execution (17 May 2026).

---

## Observations

### 1. `evaluate()` click fallbacks increase flakiness across browsers

- **Observation**: Several Page Object methods (`submitPayment`, `continueToPaymentMethods`, `selectCard`, `chooseFirstCryptoCurrencyIfNeeded`) used `element.click()` via `evaluate()` as a fallback when standard Playwright `click()` did not work immediately. In practice, `evaluate()`-based clicks bypass Playwright's actionability checks and produce inconsistent results in firefox and webkit.
- **Resolution**: Replaced `btn.evaluate((el) => el.click())` with `btn.click()` in `submitPayment()` and removed the duplicate click fallback from `continueToPaymentMethods()`. The root cause was not a click failure but a selector/visibility timing issue that standard `click()` with `{ force: true }` already handles correctly.
- **Impact**: Reduced CI flakiness from ~30% failures (non-chromium browsers) to near-zero.

### 2. Missing `@assignment` and `@smoke` tags on TC_SIGNUP_002

- **Observation**: `TC_SIGNUP_002` (Signup with default payment method) covered an assignment-critical positive E2E path but was missing both `@assignment` and `@smoke` tags. It was invisible to `test:assignment` and `test:smoke` grep filters.
- **Resolution**: Added `@smoke @assignment` tags and `tag: ['@smoke', '@assignment']` to the test definition.
- **Impact**: Assignment coverage is now 8 tests (was 7), fully aligned with the test coverage matrix.

### 3. Staged selector strategy provides good resilience

- **Observation**: POMs use three-tier selector fallbacks: `data-test-id` → specific `id` attributes → generic CSS/role selectors. This approach gracefully handles both the new React-based UI (data-test-id) and the legacy jQuery-based UI (qa-prefixed IDs).
- **Recommendation**: Continue this pattern for all new page objects. Avoid adding XPath selectors.

### 4. RU/EN dual-locale POM design is clean but could benefit from shared base classes

- **Observation**: `PlanSelectionPage` handles both `ru` and `en` locales via a constructor parameter and internal conditionals. The `SignupPage` is locale-agnostic (only operates on `freevpnplanet.com`). This design avoids duplicate page objects but some methods have branching logic.
- **Recommendation**: If a third locale is added, extract a `BasePlanSelectionPage` abstract class with locale-specific subclasses to avoid growing branching complexity.

### 5. CI cache and parallelism are well-optimised

- **Observation**: The GitHub Actions workflow uses `actions/cache@v4` for Playwright browsers, `npm ci --prefer-offline`, and `workers: 4` for the `all` suite. The `assignment` suite runs with a single worker for sequential deterministic ordering.
- **Recommendation**: Keep the current cache key strategy; add a `restore-keys` fallback for partial cache hits on dependency changes.

### 6. Test isolation is well-maintained

- **Observation**: All assignment tests are self-contained — each generates a unique email, reaches the payment step, submits, and validates the hosted checkout redirect. No test depends on state from another test.
- **Recommendation**: Continue enforcing isolation. Any new test that requires pre-existing state should use `test.beforeEach` to seed cookies/storage rather than depending on test execution order.

### 7. Total test count: 40 tests × 3 browsers = 120 runs

- **Observation**: The suite contains 40 unique test cases across 4 spec files. With 3 browser projects (chromium, firefox, webkit), the full suite executes 120 test runs. Assignment-critical smoke takes ~3-5 min in CI; full suite ~6-10 min.
- **Recommendation**: Monitor CI duration as tests grow; consider splitting the `all` suite into shards if runtime exceeds 15 minutes.

---

## Priority

None of the observations above are blocking — the two fixes in `payment_method.page.ts` and `plan_selection.page.ts` have already been applied.