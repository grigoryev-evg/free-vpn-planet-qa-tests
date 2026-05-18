# Live Browser Verification — 2026-05-17

## Summary

Проведена живая верификация всех трёх целевых страниц через Playwright MCP browser.
Подтверждены URL, DOM-структура, локаторы, методы оплаты.

---

## 1. RU: planetconfig.com

| Параметр | Значение |
|----------|----------|
| URL | `https://planetconfig.com/` |
| Заголовок | `Дешёвый персональный/выделенный VPN с личным IP адресом 🌍 Купить выделенный (личный) IP адрес 🛡 Бесплатный персональный VPN - персональный/персональная ВПН 🔥` |

### Локации (9):
- Netherlands (default, radio checked)
- Germany, USA, Romania, UK, Poland, France, Sweden, Japan

### Валюты (3):
- RUB (default, radio checked), USD, EUR

### Планы (3):
- "2 дня", "1 месяц", "1 год"

### Форма:
- Email: `textbox` placeholder `name@example.com`
- Кнопка: `button "Далее"` (НЕ "Оплатить" или "Pay")

### Payment Page:
- URL: `https://pay.planetconfig.com/payment/?ppg_nonce_1=...&gateway=&location=NL&currency_code=RUB&offer_id=1_month&email=...`
- Заголовок: `Оплата - Planet VPN`

#### Методы оплаты:
1. **Банковская карта** (radio checked by default)
   - label: "Банковская карта"
2. **Криптовалюта** (radio + dropdown)
   - label: "Криптовалюта"
   - dropdown button: "Выберите криптовалюту"
   - Опции: вероятно BTC, USDT и др.

#### Критичные отличия от существующих Page Objects:
- **Кнопка "Далее"**, а не "Pay" и не "Оплатить" на RU plan selection
- На payment page кнопка "Оплатить"
- Crypto dropdown button текст: "Выберите криптовалюту" (RU) / "Select cryptocurrency" (EN)

---

## 2. EN: personal.freevpnplanet.com

| Параметр | Значение |
|----------|----------|
| URL | `https://personal.freevpnplanet.com/` |
| Заголовок | `Your Personal VPN - Buy Static VPN and IP Address | Planet VPN` |

### Локации (1):
- Netherlands (only, radio checked by default)

### Валюты (1):
- USD (only, radio checked by default)

### Планы (3):
- "2 days 0.75 $"
- "1 month 6.90 $"
- "1 year 39 $"

### Форма:
- Email: `textbox` placeholder `name@example.com`
- Кнопка: `button "Pay"`

### Payment Page:
- URL: `https://personal.freevpnplanet.com/payment/?ppg_nonce_1=...&gateway=&location=NL&currency_code=USD&offer_id=1_month&email=...`
- Заголовок: `Payment - Planet VPN Personal`

#### Методы оплаты:
1. **Credit Card** (radio checked by default)
2. **Cryptocurrency** (radio + dropdown)
   - dropdown button: "Select cryptocurrency"

---

## 3. Signup: freevpnplanet.com → account.freevpnplanet.com

| Параметр | Значение |
|----------|----------|
| URL home | `https://freevpnplanet.com/` |
| Кнопка Log In | `link "Log In"` → `https://account.freevpnplanet.com/` |

**Примечание:** Sign Up процесс стартует с страницы аккаунта (account.freevpnplanet.com),
после логина/регистрации предлагает планы и способы оплаты.
Текущий Signup тест нуждается в ревью.

---

## 4. Валидация существующих Page Objects

### PlanSelectionPage (`plan_selection.page.ts`)
| Метод/локатор | Статус | Комментарий |
|---------------|--------|-------------|
| `goto()` | ✅ | URL формируется корректно для RU/EN |
| locale detection | ⚠️ | Нужно проверить `page.locator('html').getAttribute('lang')` |
| location selection | ⚠️ | Локаторы radio по тексту локации валидны |
| currency selection | ⚠️ | Зависит от радио-кнопок с текстом валюты |
| plan selection | ⚠️ | Селекторы по data-test-id и тексту плана |
| `fillEmail()` | ✅ | `input[type="email"]` — валидный локатор |
| `continueToPaymentMethods()` | ⚠️ | **RU кнопка "Далее", EN кнопка "Pay"** — критично! |

### PaymentMethodPage (`payment_method.page.ts`)
| Метод/локатор | Статус | Комментарий |
|---------------|--------|-------------|
| Card selection | ✅ | Radio "Credit Card" / "Банковская карта" |
| Crypto selection | ⚠️ | Dropdown button текст разный: RU "Выберите криптовалюту", EN "Select cryptocurrency" |
| Terms checkbox | ✅ | Чекбокс с Terms of use ссылкой |
| `submitPayment()` | ✅ | Кнопка "Pay" / "Оплатить" |

### SignupPage (`signup.page.ts`)
| Метод/локатор | Статус | Комментарий |
|---------------|--------|-------------|
| `goto()` | ⚠️ | Home page is freevpnplanet.com, Log In ведёт на account.freevpnplanet.com |

---

## 5. Ключевые действия

1. ✅ **Исправить PlanSelectionPage**: RU кнопка "Далее", EN кнопка "Pay"
2. ✅ **Проверить локаторы** для crypto dropdown на обоих языках
3. ✅ **Обновить signup.page.ts** если изменился флоу
4. ✅ **Запустить полный assignment suite** для подтверждения

---

## 6. Результаты живого тестирования флоу

| Сценарий | Страница | Переход на payment | Статус |
|----------|----------|-------------------|--------|
| RU monthly + card | ✅ | ✅ `pay.planetconfig.com/payment/` | OK |
| EN monthly + card | ✅ | ✅ `personal.freevpnplanet.com/payment/` | OK |
| Signup + card | ⏳ | Требует ревью account flow | PENDING |