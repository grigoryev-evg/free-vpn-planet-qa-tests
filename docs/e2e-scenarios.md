# E2E Scenarios — Пошаговые инструкции для ручного воспроизведения

> **Назначение:** документ для ручного тестирования автоматизированных E2E сценариев.
> Каждый сценарий содержит таблицу: номер шага → действие → ожидаемое поведение → фактическое (заполняется тестировщиком).
>
> **Обновление 2026-05-18:** Suite переименован — тесты `TC_ASSIGN_*` заменены на специфичные ID по spec-файлам.
> Полный список тестов: `npm run test:list`. 59 уникальных тестов в 4 spec-файлах (177 total по 3 браузерам).

---

## Общие предусловия

- Браузер в режиме инкогнито / чистый профиль (без cookies, localStorage).
- Сайты доступны по HTTPS.
- Стабильное интернет-соединение.

---

## 1. FreeVPNPlanet Sign Up — Card → Stripe + Link

**Spec:** `tests-e2e/tests/specs/checkout_matrix.e2e.ts`  
**Test ID:** `TC_FVPN_SIGNUP_CARD_001`  
**Теги:** `@assignment` `@smoke`  
**Стартовая страница:** https://freevpnplanet.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://freevpnplanet.com | Загрузилась главная страница freevpnplanet.com, видна кнопка «Sign Up» | |
| 2 | Перейти на страницу регистрации (кнопка «Sign Up») | Открылась форма регистрации с полями email, password | |
| 3 | Ввести уникальный email | Email принят, нет ошибки валидации | |
| 4 | Ввести валидный пароль | Пароль принят, нет ошибки валидации | |
| 5 | Нажать «Continue» | Открылся шаг выбора способа оплаты (видны варианты: bank card, crypto) | |
| 6 | Выбрать способ оплаты «Bank Card» | Карточная опция подсвечена/выбрана | |
| 7 | Отметить чекбокс принятия условий | Чекбокс отмечен | |
| 8 | Нажать «Pay» / «Submit» | Редирект на `checkout.stripe.com` | |
| 9 | Проверить Stripe Link popup | Открылся `checkout.link.com` для Stripe Link | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 2. FreeVPNPlanet Sign Up — Crypto → CoinPayments

**Spec:** `tests-e2e/tests/specs/checkout_matrix.e2e.ts`  
**Test ID:** `TC_FVPN_SIGNUP_CRYPTO_{CODE}` (18 валют: BTC, BTC_LN, BCH, LTC, DAI, DASH, DOGE, ETC, SHIB, SOL, TRX, TUSD, TUSD_TRC20, USDC, USDT_ERC20, USDT_SOL, USDT_TRC20, XMR)  
**Теги:** `@assignment`  
**Стартовая страница:** https://freevpnplanet.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://freevpnplanet.com | Загрузилась главная страница | |
| 2 | Sign Up (email + password) → Continue | Открылся шаг способа оплаты | |
| 3 | Выбрать способ оплаты «Cryptocurrency» | Крипто-опция выбрана | |
| 4 | Выбрать конкретную валюту в dropdown | Валюта выбрана | |
| 5 | Отметить чекбокс принятия условий | Чекбокс отмечен | |
| 6 | Нажать «Pay» | Редирект на `www.coinpayments.net` с wallet address или QR | |
| 7 | Проверить адрес/QR | На странице coinpayments отображается адрес кошелька или QR-код | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 3. PlanetConfig — Buy via bot → Telegram

**Spec:** `tests-e2e/tests/specs/planetconfig_ru.e2e.ts`  
**Test ID:** `TC_PLANETCONFIG_BOT_001`  
**Теги:** `@assignment` `@smoke`  
**Стартовая страница:** https://planetconfig.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://planetconfig.com | Загрузилась RU-версия страницы | |
| 2 | Нажать «Купить через бот» | Открылась ссылка на Telegram бот | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 4. PlanetConfig — RUB 2 days + local methods → YooMoney/NSPK

**Spec:** `tests-e2e/tests/specs/planetconfig_ru.e2e.ts`  
**Test IDs:** `TC_PLANETCONFIG_RUB_RF_BANK_CARD`, `TC_PLANETCONFIG_RUB_SBP`, `TC_PLANETCONFIG_RUB_SBERPAY`, `TC_PLANETCONFIG_RUB_YOOMONEY` (4 теста)  
**Теги:** `@assignment`  
**Стартовая страница:** https://planetconfig.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://planetconfig.com | Загрузилась RU-версия | |
| 2 | Выбрать локацию «Netherlands» | Локация выбрана | |
| 3 | Выбрать валюту «RUB» | Валюта выбрана | |
| 4 | Выбрать план «2 дня» | План выбран | |
| 5 | Ввести уникальный email | Email принят | |
| 6 | Нажать «Далее» | Открылся шаг способа оплаты | |
| 7 | Выбрать метод оплаты (Карты банков РФ / СБП / SberPay / ЮMoney) | Метод выбран | |
| 8 | Нажать «Оплатить» | Редирект на `yoomoney.ru` или `qr.nspk.ru` | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 5. PlanetConfig — RUB 2 days Credit Card → Stripe + Link

**Spec:** `tests-e2e/tests/specs/planetconfig_ru.e2e.ts`  
**Test ID:** `TC_PLANETCONFIG_RUB_2_DAYS_CREDIT_CARD`  
**Теги:** `@assignment`  
**Стартовая страница:** https://planetconfig.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://planetconfig.com | Загрузилась RU-версия | |
| 2 | Выбрать «Netherlands», «RUB», «2 дня» | План выбран | |
| 3 | Ввести email → «Далее» | Шаг способа оплаты | |
| 4 | Выбрать «Credit Card» | Карточная опция выбрана | |
| 5 | Нажать «Оплатить» | Редирект на `checkout.stripe.com` → Link popup на `checkout.link.com` | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 6. PlanetConfig — RUB/USD/EUR monthly Credit Card → Stripe + Link

**Spec:** `tests-e2e/tests/specs/planetconfig_ru.e2e.ts`  
**Test IDs:** `TC_PLANETCONFIG_RUB_CARD`, `TC_PLANETCONFIG_USD_CARD`, `TC_PLANETCONFIG_EUR_CARD` (3 теста)  
**Теги:** `@assignment` `@smoke`  
**Стартовая страница:** https://planetconfig.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://planetconfig.com | Загрузилась страница | |
| 2 | Выбрать «Netherlands», валюту (RUB/USD/EUR), «1 месяц» | План выбран | |
| 3 | Ввести email → «Далее» | Шаг способа оплаты | |
| 4 | Выбрать «Credit Card» | Карточная опция выбрана | |
| 5 | Нажать «Оплатить» | Редирект на `checkout.stripe.com` → Link popup | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 7. PlanetConfig — RUB/USD/EUR month/year Bitcoin → CoinPayments

**Spec:** `tests-e2e/tests/specs/planetconfig_ru.e2e.ts`  
**Test IDs:** `TC_PLANETCONFIG_{CUR}_{PLAN}_CRYPTO_BTC` (3 валюты × 2 плана = 6 тестов) + `TC_PLANETCONFIG_CRYPTO_NETWORK_{CODE}` (18 валют)  
**Теги:** `@assignment`  
**Стартовая страница:** https://planetconfig.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://planetconfig.com | Загрузилась страница | |
| 2 | Выбрать «Netherlands», валюту (RUB/USD/EUR), план (месяц/год) | План выбран | |
| 3 | Ввести email → «Далее» | Шаг способа оплаты | |
| 4 | Выбрать «Cryptocurrency» | Крипто-опция выбрана | |
| 5 | Выбрать валюту в dropdown | Валюта выбрана | |
| 6 | Нажать «Оплатить» | Редирект на `www.coinpayments.net` с адресом/QR | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 8. Personal FreeVPNPlanet — RUB SBP → kassa.ai

**Spec:** `tests-e2e/tests/specs/personal_vpn_en.e2e.ts`  
**Test ID:** `TC_PERSONAL_RUB_SBP`  
**Теги:** `@assignment` `@smoke`  
**Стартовая страница:** https://personal.freevpnplanet.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://personal.freevpnplanet.com | Загрузилась EN-версия | |
| 2 | Выбрать валюту «RUB» | RUB выбран | |
| 3 | Выбрать план «1 Month» | План выбран | |
| 4 | Ввести email → «Continue» | Шаг способа оплаты | |
| 5 | Выбрать «СБП» | СБП выбрано | |
| 6 | Отметить terms → «Pay» | Редирект на `paymentt.kassa.ai` | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 9. Personal FreeVPNPlanet — RUB/EUR monthly Credit Card → Stripe

**Spec:** `tests-e2e/tests/specs/personal_vpn_en.e2e.ts`  
**Test IDs:** `TC_PERSONAL_RUB_CARD`, `TC_PERSONAL_EUR_CARD` (2 теста)  
**Теги:** `@assignment` `@smoke`  
**Стартовая страница:** https://personal.freevpnplanet.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://personal.freevpnplanet.com | Загрузилась страница | |
| 2 | Выбрать валюту (RUB/EUR), «1 Month» | План выбран | |
| 3 | Ввести email → «Continue» | Шаг способа оплаты | |
| 4 | Выбрать «Credit Card» → terms → «Pay» | Редирект на `checkout.stripe.com` | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## 10. Personal FreeVPNPlanet — RUB/EUR monthly Bitcoin → CoinPayments

**Spec:** `tests-e2e/tests/specs/personal_vpn_en.e2e.ts`  
**Test IDs:** `TC_PERSONAL_RUB_MONTHLY_CRYPTO_BTC`, `TC_PERSONAL_EUR_MONTHLY_CRYPTO_BTC` (2 теста)  
**Теги:** `@assignment`  
**Стартовая страница:** https://personal.freevpnplanet.com

| № | Действие | Ожидаемое поведение | Фактическое (заполнить) |
|---|----------|---------------------|-------------------------|
| 1 | Открыть https://personal.freevpnplanet.com | Загрузилась страница | |
| 2 | Выбрать валюту (RUB/EUR), «1 Month» | План выбран | |
| 3 | Ввести email → «Continue» | Шаг способа оплаты | |
| 4 | Выбрать «Cryptocurrency» → Bitcoin → terms → «Pay» | Редирект на `www.coinpayments.net` с адресом/QR | |

**Результат:** ✅ Passed / ❌ Failed  
**Комментарий:** ___________________________________

---

## Сводная таблица результатов ручного прогона

| Spec File | Test Count | Pass/Fail | Комментарий |
|-----------|------------|-----------|-------------|
| `checkout_matrix.e2e.ts` | 19 (1 card + 18 crypto) | | |
| `planetconfig_ru.e2e.ts` | 32 | | |
| `personal_vpn_en.e2e.ts` | 6 | | |
| `payment_contract.e2e.ts` | 2 | | |
| **Total** | **59** | | |

**Pass Rate:** ___ / 59 (___%)

---

## Примечания

- **Email:** Использовать уникальный email при каждом прогоне (добавлять timestamp: `test+YYYYMMDDHHmm@example.com`).
- **Пароль для Sign Up:** Берётся из `.env` переменной `SIGNUP_PASSWORD` (мин. требования: 8+ символов, цифры, заглавная буква).
- **Платёжные провайдеры:** Список разрешённых хостов — в `tests-e2e/tests/browser/pages/payment_page.page.ts` (метод `expectAllowedProviderHost` и специфичные методы).
- **Автоматизированные тесты:** `npm run test:assignment` — все `@assignment` тесты в chromium (~40-60 секунд).
- **Feature-файлы:** `tests-e2e/features/` (BDD-спецификации на Gherkin).