# Описание всех тестов проекта

## Зачем в проекте два слоя тестов

В репозитории сейчас есть два типа сценариев:

- `smoke` — стабильные E2E-проверки основных шагов пользовательских сценариев
- `known-issues` — проверки, которые воспроизводят найденные продуктовые дефекты checkout flow

Идея была такой:

- `smoke` показывает, что проект запускается, селекторы актуальны, ключевые шаги сценариев покрыты
- `known-issues` сохраняет найденные баги в исполняемом виде, чтобы было понятно, где именно продукт расходится с ожидаемым результатом

Для тестового задания основной упор нужно делать именно на `smoke`, а `known-issues` воспринимать как дополнительную аналитическую часть.

## Как были найдены баги

Найденные проблемы были получены не "из головы", а во время живой проверки продовых страниц:

1. Запускались реальные сценарии через Playwright против боевых URL.
2. Снимались screenshots, videos и traces на падениях.
3. Проверялась текущая DOM-структура страниц и реальные payment flow после submit.
4. Сравнивался ожидаемый результат задания с фактическим поведением:
   - открывается ли страница выбора способа оплаты
   - открывается ли hosted checkout
   - уходит ли форма после submit
   - доступны ли заявленные способы оплаты

Именно так были выявлены расхождения, которые потом были вынесены в `known-issues`.

---

## 1. Тесты Sign Up

### Файл

[`tests/auth-signup.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/auth-signup.spec.ts)

### Тест

#### `opens sign up order page and displays payment methods`

Что делает:

1. Открывает `https://freevpnplanet.com`
2. Нажимает `Log In`
3. Переходит в `Sign Up`
4. Закрывает cookies popup, если он показан
5. Заполняет email
6. Нажимает `Next`
7. Проверяет, что на order page появились способы оплаты

Что именно проверяет:

- переход с marketing page в login/account area
- доступность сценария `Sign Up`
- работа первого шага формы с email
- наличие payment methods на order page

Чем управляет:

- `HomePage` — переход с главной на login
- `AccountPage` — действия на `account.freevpnplanet.com`

Покрывает ли тестовое задание:

- покрывает начало сценария `Проверка Sign Up`
- **не покрывает полностью** финальный шаг задания, где после `Get your subscription` должна открыться корректная страница оплаты

Почему не полностью:

- на текущем состоянии продукта submit checkout со страницы `account.freevpnplanet.com/order/` не доводит сценарий до hosted payment page

---

## 2. Тесты покупки персонального VPN (EN)

### Файл

[`tests/personal-vpn-en.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/personal-vpn-en.spec.ts)

### Параметры набора

Тесты запускаются для:

- планов:
  - `1 month`
  - `1 year`
- способов оплаты:
  - `bank card`
  - `cryptocurrency`

Итого в файле 4 теста.

### Тест 1

#### `EN personal VPN 1 month redirects to checkout via bank card`

Что делает:

1. Открывает `https://personal.freevpnplanet.com/`
2. Выбирает сервер `Netherlands`
3. Выбирает валюту `USD`
4. Выбирает план `1 month`
5. Заполняет email
6. Переходит на страницу выбора способа оплаты
7. Проверяет, что способ оплаты `Credit Card` доступен

Что покрывает:

- открытие EN страницы продукта
- выбор параметров покупки
- переход на payment method page
- наличие card payment option

### Тест 2

#### `EN personal VPN 1 month redirects to checkout via cryptocurrency`

Что делает:

1. Повторяет шаги сценария `1 month`
2. Доходит до payment method page
3. Проверяет, что доступен crypto payment option

Что покрывает:

- тот же EN flow
- наличие crypto payment option для месячного плана

### Тест 3

#### `EN personal VPN 1 year redirects to checkout via bank card`

Что делает:

1. Открывает EN страницу
2. Выбирает `1 year`
3. Доходит до payment method page
4. Проверяет, что card payment option доступен

Что покрывает:

- годовой EN flow
- наличие card option

### Тест 4

#### `EN personal VPN 1 year redirects to checkout via cryptocurrency`

Что делает:

1. Открывает EN страницу
2. Выбирает `1 year`
3. Доходит до payment method page
4. Пытается проверить наличие crypto payment option

Статус:

- этот тест помечен как `expected failure`

Почему:

- на текущем состоянии продукта для годового EN flow crypto option не отображается

Покрывает ли EN файл тестовое задание:

- **частично**
- он покрывает:
  - открытие страницы
  - выбор плана
  - переход на страницу выбора способа оплаты
  - проверку доступности способов оплаты
- он **не покрывает полностью** финальный переход на hosted payment page в рамках smoke-набора

---

## 3. Тесты покупки персонального VPN (RU)

### Файл

[`tests/personal-vpn-ru.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/personal-vpn-ru.spec.ts)

### Параметры набора

Тесты запускаются для:

- `bank card`
- `cryptocurrency`

Итого в файле 2 теста.

### Тест 1

#### `RU personal VPN purchase redirects to checkout via bank card`

Что делает:

1. Открывает `https://planetconfig.com/`
2. Выбирает дефолтные параметры:
   - location: `Netherlands`
   - currency: `RUB`
   - plan: `1 месяц`
3. Заполняет email
4. Переходит на страницу выбора способа оплаты
5. Проверяет, что доступен способ оплаты `Карты Банков РФ`

Что покрывает:

- RU landing page
- выбор параметров
- переход на payment method page
- доступность card option

### Тест 2

#### `RU personal VPN purchase redirects to checkout via cryptocurrency`

Что делает:

1. Повторяет RU flow
2. Доходит до payment method page
3. Проверяет, что доступна кнопка выбора криптовалюты

Что покрывает:

- RU flow до payment method page
- наличие crypto payment option

Покрывает ли RU файл тестовое задание:

- **частично**
- он покрывает:
  - открытие RU страницы
  - выбор опций покупки
  - переход на страницу выбора способа оплаты
  - проверку доступности нескольких payment methods
- он **не покрывает полностью** шаг "перейдите на страницу оплаты" в составе smoke-набора

---

## 4. Тесты воспроизведения найденных багов

### Файл

[`tests/known-issues.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/known-issues.spec.ts)

Этот файл не является классическим набором "основных E2E по заданию".  
Он нужен для воспроизведения и документирования найденных checkout-проблем.

### Тест 1

#### `sign up submit should reach hosted checkout`

Что делает:

1. Идет по Sign Up flow
2. Выбирает `card`
3. Принимает terms
4. Нажимает `Get your subscription`
5. Проверяет, что должен открыться hosted checkout

Фактический результат:

- checkout не открывается как ожидается

Что это означает:

- это воспроизведение найденного бага в Sign Up flow

### Тест 2

#### `EN dedicated VPN card submit should reach hosted checkout`

Что делает:

1. Идет по EN flow с планом `1 month`
2. Доходит до payment method page
3. Выбирает `bank card`
4. Принимает terms
5. Нажимает `Pay`
6. Проверяет, что должен открыться hosted checkout

Фактический результат:

- product ведет себя нестабильно и не всегда доводит сценарий до ожидаемой payment page

### Тест 3

#### `RU dedicated VPN card submit should reach hosted checkout`

Что делает:

1. Идет по RU flow с планом `1 месяц`
2. Доходит до payment method page
3. Выбирает `bank card`
4. Принимает terms
5. Нажимает `Оплатить`
6. Проверяет, что должен открыться hosted checkout

Фактический результат:

- сценарий используется как воспроизведение найденной проблемы в checkout части RU flow

Важно:

- этот файл нужен скорее как аналитический/дефектный слой
- для основной демонстрации проекта работодателю это вспомогательная часть, а не ядро решения

---

## Покрытие тестового задания

### Что покрыто хорошо

1. Навигация по страницам из задания
2. Выбор планов и базовых purchase options
3. Переход на страницу выбора payment method
4. Проверка доступности способов оплаты
5. Проверка нескольких payment methods
6. Выявление фактических дефектов в checkout flow

### Что покрыто частично

1. `Sign Up`
   - до payment method step покрыто
   - hosted checkout после `Get your subscription` на smoke-уровне не подтвержден из-за найденной проблемы продукта

2. `RU purchase`
   - payment method page покрыта
   - финальный стабильный переход на hosted payment page в основном smoke-наборе не зафиксирован как основной happy path

3. `EN purchase`
   - payment method page покрыта
   - happy path checkout подтвержден частично
   - yearly crypto flow сейчас выглядит продуктово недоступным

### Честная оценка относительно задания

Если смотреть строго на текст задания, текущая реализация:

- **не закрывает его на 100% как happy-path E2E набор**
- **закрывает его хорошо как исследовательский E2E + defect-oriented automation набор**

То есть проект сейчас показывает:

- умение строить Playwright framework
- умение стабилизировать селекторы
- умение автоматизировать реальные живые сценарии
- умение находить product issues и формулировать их как наблюдения

Но если цель — "строгое полное соответствие формулировке тестового", то логически следующий шаг был бы:

1. оставить основные E2E сценарии по заданию как главный набор
2. defects вынести в сопроводительный документ
3. `known-issues` использовать аккуратно, как дополнительный evidence layer

---

## Что за что отвечает в текущем наборе

### `smoke`

Назначение:

- быстрый демонстрационный ручной прогон
- проверка, что ключевые пользовательские этапы доступны
- подтверждение, что automation framework живой и запускаемый

Что туда входит:

- [`tests/auth-signup.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/auth-signup.spec.ts)
- [`tests/personal-vpn-en.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/personal-vpn-en.spec.ts)
- [`tests/personal-vpn-ru.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/personal-vpn-ru.spec.ts)

### `known-issues`

Назначение:

- воспроизведение найденных checkout-проблем
- хранение дефектов в исполняемом виде
- помощь в аналитике и дальнейшей регрессии

Что туда входит:

- [`tests/known-issues.spec.ts`](C:/Users/cbz_pc/free-vpn-planet-qa-tests/tests/known-issues.spec.ts)

---

## Вывод

На текущий момент проект хорошо демонстрирует:

- архитектуру Playwright-проекта
- data-driven тесты
- page object подход
- CI/CD integration в GitHub Actions
- отчеты и артефакты
- аналитическую работу по выявлению дефектов

Но при защите тестового задания важно проговорить вслух:

- какие сценарии покрыты полностью
- какие покрыты частично
- какие product bugs были найдены в checkout flow
- почему часть логики вынесена в `known-issues`, а не только в happy-path smoke

