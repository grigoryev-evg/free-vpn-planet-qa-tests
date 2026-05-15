# E2E Test Strategy

## Цель

Построить тестовый проект не как набор разрозненных happy-path проверок, а как структурированную систему автотестов с несколькими уровнями:

- `smoke`
- `e2e-ui`
- `e2e-api`

При этом найденные баги нужны, но не как отдельная концепция `known-issues`.  
Они должны быть результатом выполнения основных E2E-сценариев и дополнительно описываться в сопроводительном документе.

---

## Базовые принципы

1. `smoke` — короткий, быстрый и демонстрационный набор
2. `e2e-ui` — основной функциональный набор по заданию
3. `e2e-api` — дополнительный технический слой без UI
4. баги фиксируются:
   - в результатах E2E
   - в отчетах
   - в сопровождающем документе
5. отдельный suite `known-issues` не является целевой моделью проекта

---

## Структура тестовых слоев

## 1. Smoke

Назначение:

- быстро показать, что ключевые пользовательские маршруты живы
- дать зеленый ручной запуск в GitHub Actions
- быть легким демонстрационным слоем для работодателя

### План smoke-набора

1. `signup basic`
2. `personal vpn ru basic`
3. `personal vpn en basic`

### Что должен проверять smoke

#### Sign Up basic

- открытие `freevpnplanet.com`
- переход `Log In`
- переход `Sign Up`
- ввод email
- переход к шагу payment method
- наличие payment methods и кнопки продолжения

#### RU basic

- открытие `planetconfig.com`
- выбор дефолтных purchase options
- переход на payment method page
- наличие card option
- наличие crypto option

#### EN basic

- открытие `personal.freevpnplanet.com`
- выбор `1 month`
- переход на payment method page
- наличие card option
- наличие crypto option

---

## 2. E2E UI

Это основной слой по заданию.

Его нужно разбить на несколько подпапок/категорий:

- `happy-path`
- `validation`
- `state`

---

### 2.1 Happy-path

Позитивные пользовательские сценарии.

### Целевая матрица

1. `signup card submit`
2. `ru month card`
3. `ru month crypto`
4. `en month card`
5. `en month crypto`
6. `en year card`
7. `en year crypto`

### Что должно покрываться

#### Sign Up

- открыть `freevpnplanet.com`
- перейти `Log In`
- перейти `Sign Up`
- заполнить обязательные поля
- выбрать payment method
- нажать `Get your subscription`
- проверить, что открылась реальная payment/provider page

#### RU

- открыть `planetconfig.com`
- выбрать параметры покупки
- перейти на payment method page
- выбрать payment method
- нажать `Оплатить`
- проверить открытие payment/provider page

#### EN

- открыть `personal.freevpnplanet.com`
- выбрать план `1 month` или `1 year`
- перейти на payment method page
- выбрать payment method
- нажать `Pay`
- проверить открытие payment/provider page

---

### 2.2 Validation

Негативные сценарии и проверки валидаций.

### Целевая матрица

1. `signup invalid email`
2. `signup empty email`
3. `signup without terms`
4. `ru empty email`
5. `ru invalid email`
6. `ru without terms`
7. `en empty email`
8. `en invalid email`
9. `en without terms`

### Что должны проверять validation-сценарии

#### Sign Up validation

- пустой email
- невалидный email
- отсутствие подтверждения terms
- отсутствие перехода к оплате при невалидном состоянии формы

#### RU validation

- пустой email
- невалидный email
- невозможность оплаты без terms

#### EN validation

- пустой email
- невалидный email
- невозможность оплаты без terms

---

### 2.3 State

Проверки динамического поведения интерфейса.

### Целевая матрица

1. `ru price changes with plan`
2. `ru price changes with currency`
3. `en price changes with plan`
4. `selected payment method is visually active`
5. `crypto selection updates control label or value`

### Что должны проверять state-сценарии

- изменение summary/price после смены плана
- изменение summary/price после смены валюты
- корректный active state payment method
- корректная фиксация выбранной криптовалюты в UI

---

## 3. E2E API

Это отдельный слой без UI.

Его задача:

- ускорить проверки
- проверить backend/network поведение
- подтвердить корректность checkout flow на техническом уровне

### Рекомендуемая структура

- `network`
- `checkout-contract`

### Целевая матрица

1. `payment pages return expected status`
2. `redirects after submit point to expected provider domains`
3. `checkout url contains required params`
4. `provider host belongs to allowed list`

### Что именно имеется в виду

#### Network

- целевые страницы отвечают ожидаемым статусом
- нет явных `500`/`502`/`503` на ключевых шагах

#### Checkout contract

- после submit редирект указывает на корректный payment host
- checkout URL содержит ожидаемые query params / данные заказа
- host belongs to expected providers

---

## Что считать успешным E2E-результатом

Для основных happy-path E2E сценариев успехом считается:

1. после submit пользователь уходит с исходной формы
2. открывается корректная payment/provider page
3. URL принадлежит ожидаемому провайдеру или checkout endpoint

### Примеры допустимых payment/provider хостов

- `checkout.stripe.com`
- `yoomoney.ru`
- `paymentt.kassa.ai`
- другие реальные payment-provider домены, если они подтверждены в ходе выполнения сценария

### Что не считается успешным happy-path результатом

- остаться на той же форме без перехода
- отсутствие реакции после submit
- открытие `failed` page
- недоступность заявленного payment method

Если это происходит, это считается найденным дефектом.

---

## Как трактовать найденные баги

Найденные баги нам нужны.

Но они:

- не должны жить как отдельная основная философия проекта
- не должны заменять основное E2E-покрытие

Они должны:

1. всплывать в реальных сценариях
2. сохраняться в отчетах
3. описываться в findings / recommendations документе

---

## Целевой итоговый вид проекта

## Suites

- `smoke`
- `e2e-ui`
- `e2e-api`

## Внутреннее дерево

### `smoke`

- signup basic
- ru basic
- en basic

### `e2e-ui/happy-path`

- signup card submit
- ru month card
- ru month crypto
- en month card
- en month crypto
- en year card
- en year crypto

### `e2e-ui/validation`

- signup invalid email
- signup empty email
- signup without terms
- ru empty email
- ru invalid email
- ru without terms
- en empty email
- en invalid email
- en without terms

### `e2e-ui/state`

- ru price changes with plan
- ru price changes with currency
- en price changes with plan
- selected payment method is visually active
- crypto selection updates control label or value

### `e2e-api/network`

- payment pages return expected status

### `e2e-api/checkout-contract`

- redirects after submit point to expected provider domains
- checkout url contains required params
- provider host belongs to allowed list

---

## На чем работаем дальше

Дальнейшая работа идет по этому документу как по основному контексту.

Следующие шаги:

1. утвердить итоговую матрицу сценариев
2. перестроить текущий проект под `smoke + e2e-ui + e2e-api`
3. убрать `known-issues` как отдельный suite
4. перенести найденные баги в отдельное описание findings

