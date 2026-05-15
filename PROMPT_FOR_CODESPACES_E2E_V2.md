# ПРОМПТ: пересмотри и доработай E2E-тесты на Playwright + TypeScript (максимальное покрытие)

Проект использует Playwright + TypeScript для E2E-тестов.  
Цель:
- Покрыть 100 % тестового задания (Sign Up, VPN RU, VPN EN).
- Проверить все возможные сценарии:
  - с куками и без кук,
  - разные состояния UI-компонентов,
  - переходы между страницами, модалки, confirm-диалоги.
- Сделать флоу максимально пошагово понятным и пригодным для анализа через Playwright-trace, видео и логи.

---

## 1. Общая задача (тестовое задание)

Тестовое задание включает три блока:

1. Проверка Sign Up
   - Открыть https://freevpnplanet.com/.
   - Перейти через Log In -> Sign Up.
   - Заполнить поля + payment method.
   - Нажать Get your subscription.
   - Проверить, что ссылка на оплату сформирована и корректная страница оплаты открыта.

2. Проверка покупки персонального VPN (RU)
   - Открыть https://planetconfig.com/.
   - Выбрать опции покупки -> страница выбора способа оплаты -> страница оплаты.
   - Повторить для нескольких способов оплаты, включая криптовалюту.

3. Проверка покупки персонального VPN (EN)
   - Открыть https://personal.freevpnplanet.com/.
   - Выбрать plan (месяц/год) -> выбор способа оплаты -> страница оплаты.
   - Повторить для обоих способов оплаты.

Требуется:
- Для каждого сценария -> E2E-тест.
- Покрытие 100 % по шагам и сценариям, включая максимальное количество edge-cases.

---

## 2. Структура репозитория

Ожидаемая структура:

```text
/tests-e2e/
  /features
    signup.feature
    personal_vpn_ru.feature
    personal_vpn_en.feature

  /tests
    /browser
      pages/
        signup.page.ts
        plan_selection.page.ts
        payment_method.page.ts
        payment_page.page.ts
      helpers/
        cookies.ts
        storage.ts
        ui_state.ts

    /specs
      signup.e2e.ts
      personal_vpn_ru.e2e.ts
      personal_vpn_en.e2e.ts

  /data
    users.ts
    plans.ts
    payment_methods.ts

  /utils
    helpers.ts
    playwright.setup.ts
    scenario_runner.ts
```

Требование к CodeSpaces / Cursor:
- Если структура отличается -> предложить миграцию и оптимизацию (например, page-объекты, вынос локаторов).

---

## 3. Подход: запись трассы и анализ флоу

1. Запись реального сценария

- Запусти Playwright в headed-режиме и вручную пройди:
  - Sign Up -> выбор плана -> payment method -> страница оплаты.
- Запиши:
  - все URL,
  - все всплывающие окна (модалки, подтверждение, ошибки),
  - все состояния кнопок (enabled/disabled, loading-state),
  - все POST/XHR-запросы к `/api/signup`, `/api/payment`, `/checkout`.

2. Playwright-trace и анализ

Убедись, что `playwright.config.ts` включает:

```ts
use: {
  trace: "retain-on-failure",
  screenshot: "retain-on-failure",
  video: "retain-on-failure",
},
```

Требование:
- Для каждого тест-кейса:
  - сохранить trace,
  - превратить шаги trace в пошаговый E2E-сценарий (комментарии в `.ts`).

---

## 4. Покрытие по сценариям: максимальный список

### 4.1 Sign Up (`freevpnplanet.com`)

#### 4.1.1 Позитивные сценарии

- `TC_SIGNUP_001` — успешная регистрация, карта.
- `TC_SIGNUP_002` — успешная регистрация, криптовалюта.
- `TC_SIGNUP_003` — регистрация с уже существующим email (успешный логин после регистрации? проверить UX).

#### 4.1.2 Негативные / валидация

- `TC_SIGNUP_004` — невалидный email.
- `TC_SIGNUP_005` — невалидный пароль (короткий, без цифр, без uppercase).
- `TC_SIGNUP_006` — разные password / confirm.
- `TC_SIGNUP_007` — пустые поля.
- `TC_SIGNUP_008` — попытка нажать кнопку `Get your subscription` до заполнения обязательных полей.

Для каждого:
- Проверить:
  - нет редиректа на страницу оплаты,
  - есть UI-ошибки / подсказки,
  - кнопка не активна или не отправляет запрос.

#### 4.1.3 Сценарии с cookies / localStorage

- `TC_SIGNUP_COOKIES_001` — с включёнными куками:
  - Пользователь уже заходил в браузере, cookies сохранены.
  - Проверить:
    - логика prefetch-данных (например, страны, email),
    - UI-состояния (pre-заполненные поля).

- `TC_SIGNUP_COOKIES_002` — без кук (private / `browserContext` с очищенным storage):
  - Очистить куки + `localStorage` через `context.clearCookies()` + `page.evaluate(() => localStorage.clear())`.
  - Проверить:
    - нет предзаполненных данных,
    - UI выглядит чистым.

- `TC_SIGNUP_COOKIES_003` — сессия закончилась:
  - Явно удалить куки `_auth` после успешной регистрации (или имитировать expired),
  - проверить, что при попытке запроса оплаты:
    - пользователь перенаправляется на `login` / `sign up`,
    - UI показывает соответствующий экран.

#### 4.1.4 Состояния UI-компонентов

- `TC_SIGNUP_UI_001` — кнопка `Get your subscription`:
  - `disabled` до заполнения обязательных полей.
  - после ввода корректных данных -> `enabled`.
- `TC_SIGNUP_UI_002` — `loading-state`:
  - после нажатия кнопки показывается спиннер,
  - текст/кнопка меняется на `Loading`,
  - после редиректа состояние UI обновляется.

---

### 4.2 Personal VPN (RU) — `planetconfig.com`

#### 4.2.1 Позитивные сценарии

- `TC_VPN_RU_001` — monthly plan + карта.
- `TC_VPN_RU_002` — annual plan + карта.
- `TC_VPN_RU_003` — monthly plan + крипта.
- `TC_VPN_RU_004` — annual plan + крипта.

#### 4.2.2 Негативные / UX

- `TC_VPN_RU_005` — отмена оплаты (кнопка Назад / Cancel до оплаты).
- `TC_VPN_RU_006` — ошибка оплаты (declined card, 3DSMS cancelled).
- `TC_VPN_RU_007` — изменение плана на странице конфигурации после выбора оплаты.

#### 4.2.3 Сессии / куки

- `TC_VPN_RU_COOKIES_001` — с куками:
  - пользователь уже выбирал страны/планы,
  - UI сохраняет последние выборы.
- `TC_VPN_RU_COOKIES_002` — без кук:
  - всё с нуля, UI reset.
- `TC_VPN_RU_COOKIES_003` — ручной запуск без cookies:
  - проверить, что `localStorage` не влияет на корректность флоу.

#### 4.2.4 UI-состояния компонентов

- `TC_VPN_RU_UI_001` — переключатель плана (месяц/год):
  - UI-состояние (активный/неактивный),
  - обновление цена/месяц и итоговая сумма.
- `TC_VPN_RU_UI_002` — шаги wizard:
  - активный шаг подсвечен,
  - прогресс-бар отображается,
  - нельзя вручную перейти на шаг Payment без предзаполнения.

---

### 4.3 Personal VPN (EN) — `personal.freevpnplanet.com`

- `TC_VPN_EN_001` — monthly + карта.
- `TC_VPN_EN_002` — annual + карта.
- `TC_VPN_EN_003` — monthly + PayPal.
- `TC_VPN_EN_004` — annual + PayPal.

Плюс вариации:

- `TC_VPN_EN_COOKIES_001` — с куками (логин/предыдущие планы).
- `TC_VPN_EN_COOKIES_002` — без кук.
- `TC_VPN_EN_UI_001` — UI-переключатель валют / языков (если есть).
- `TC_VPN_EN_UI_002` — `loading-state` после нажатия `Pay`.

---

## 5. Всплывающие окна и модалки

Для каждого основного блока добавить:

- `TC_SIGNUP_MODAL_001` — модалка подтверждения `Are you sure you want to proceed?` при попытке уйти от заполнения формы.
- `TC_SIGNUP_MODAL_002` — модалка ошибки с `Close` / `Try again`.
- `TC_VPN_RU_MODAL_001` — confirm-диалог при смене плана на странице оплаты.
- `TC_VPN_EN_MODAL_001` — tooltips / подсказки по полю ввода.

Проверить:
- что модалка открывается при ожидаемом триггере,
- что кнопка `Cancel` закрывает её и не прерывает флоу вне зависимости,
- что кнопка `Confirm` продолжает флоу.

---

## 6. Что ещё проверять на уровне E2E

### 6.1 Состояние компонентов UI

- `disabled/enabled` кнопок,
- `loading/spinner`,
- индикаторы ошибок/успешных действий,
- цвет/текст/иконки при `hover/active/focus`.

### 6.2 Cookies, `localStorage`, `sessionStorage`

- Разные сценарии:
  - полный доступ (`cookies + localStorage`),
  - блокированные куки,
  - только `localStorage`,
  - только `sessionStorage`.
- Проверить:
  - корректность UX (нет зависших/странных состояний),
  - корректность восстановления UI-состояния.

### 6.3 Несколько браузеров / контекстов

- Запускать ключевые сценарии в `chromium`, `firefox`, `webkit`:
  - `TC_SIGNUP_001_CHROME`, `_FIREFOX`, `_WEBKIT`.
- Проверить:
  - одинаковость поведения,
  - одинаковость URL-редиректов,
  - одинаковость текстов и UI-элементов.

---

## 7. Формат теста в TypeScript (Playwright)

Для каждого ID использовать:

```ts
test("TC_SIGNUP_001_COOKIES_ON - Successful signup with cookies enabled", async ({ page, context }) => {
  const cookiesOn = await context.cookies();
  expect(cookiesOn).not.toHaveLength(0);

  await page.goto("https://freevpnplanet.com/");

  await page.getByRole("button", { name: "Log In" }).click();
  await page.getByText("Sign Up").click();

  await page.getByLabel("Email").fill("valid@test.com");
  await page.getByLabel("Password").fill("TestPass123!");
  await page.getByLabel("Confirm password").fill("TestPass123!");

  await page.getByLabel("Payment method").selectOption("card");
  await page.getByRole("button", { name: "Get your subscription" }).click();

  await expect(page).toHaveURL(/checkout\.stripe\.com/);
  await expect(page.getByText("Payment for your subscription")).toBeVisible();
});
```

---

## 8. Требования к CodeSpaces / Cursor

Открой этот файл и дай следующий запрос системе:

> Проанализируй текущий E2E-проект на Playwright + TypeScript:
>
> 1. Сравни существующие тесты с этим списком `TC_SIGNUP_*`, `TC_VPN_RU_*`, `TC_VPN_EN_*`, `TC_*_COOKIES_*`, `TC_*_UI_*`, `TC_*_MODAL_*`.
> 2. Найди:
>    - все отсутствующие сценарии,
>    - частично реализованные сценарии (например, есть шаги, но нет проверки редиректа на оплату).
> 3. Для каждого отсутствующего сценария:
>    - запиши полный пошаговый флоу (шаги и ожидания),
>    - предложи код Playwright-теста на TypeScript в формате `test("TC_XXX...", async ({ page, context }) => { ... })`.
> 4. Проверь, что:
>    - для каждого блока тестового задания есть полный сценарий (с куками, без кук, с UI-состояниями),
>    - все переходы, модалки, confirm-диалоги и страницы оплаты проверяются.
> 5. Если увидишь дублирование или неоптимальную структуру -> предложи:
>    - page-объекты,
>    - вынос общих шагов в хелперы,
>    - рефакторинг файлов (`signup.page.ts`, `plan_selection.page.ts`, `payment_method.page.ts`).

---

Если хочешь, могу:
- сразу сгенерировать полный список TC ID в виде таблицы (`ID | Module | Scenario type | Notes`),
- или реальные примеры 3-4 тест-кейсов с cookies / без cookies и UI-состояниями, чтобы их можно было сразу вставить в `specs/`.
