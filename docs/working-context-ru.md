# Рабочий контекст проекта

Этот файл является основным рабочим контекстом для дальнейшей переработки тестового проекта.

## Исходное задание

Источник: [TEST_ASSIGNMENT.md](C:/Users/cbz_pc/free-vpn-planet-qa-tests/TEST_ASSIGNMENT.md)

Нужно автоматизировать через Playwright:

1. `Sign Up` на `https://freevpnplanet.com/`
2. покупку персонального VPN RU на `https://planetconfig.com/`
3. покупку персонального VPN EN на `https://personal.freevpnplanet.com/`

Также нужно:

- оформить проект так, чтобы он корректно открывался и запускался;
- подготовить findings/recommendations по найденным проблемам;
- держать репозиторий и CI в аккуратном состоянии.

## Что уже есть в проекте

Сейчас в репозитории уже присутствуют:

- Playwright + TypeScript;
- page object слой;
- GitHub Actions с ручным запуском;
- HTML/JUnit отчеты;
- GitHub Pages для публикации последнего smoke report;
- существующие тесты:
  - `tests/auth-signup.spec.ts`
  - `tests/personal-vpn-ru.spec.ts`
  - `tests/personal-vpn-en.spec.ts`
  - `tests/known-issues.spec.ts`

## Что меняем концептуально

Отдельный suite `known-issues` не является целевой моделью проекта.

Причина:

- тестовое задание просит E2E сценарии по продукту;
- баги нам нужны, но как результат выполнения E2E, а не как отдельная философия набора;
- найденные проблемы должны фиксироваться в отчете и сопроводительном документе.

## Целевая структура проекта

Проект перестраивается в три слоя:

1. `smoke`
2. `e2e-ui`
3. `e2e-api`

### 1. Smoke

Назначение:

- быстрый ручной прогон;
- демонстрация, что ключевые маршруты живы;
- зеленый базовый CI-сигнал.

Целевой состав:

1. `signup basic`
2. `personal vpn ru basic`
3. `personal vpn en basic`

### 2. E2E UI

Это основной слой покрытия по заданию.

Подслои:

- `happy-path`
- `validation`
- `state`

#### Happy-path

Целевые сценарии:

1. `signup card submit`
2. `ru month card`
3. `ru month crypto`
4. `en month card`
5. `en month crypto`
6. `en year card`
7. `en year crypto`

#### Validation

Целевые сценарии:

1. `signup invalid email`
2. `signup empty email`
3. `signup without terms`
4. `ru empty email`
5. `ru invalid email`
6. `ru without terms`
7. `en empty email`
8. `en invalid email`
9. `en without terms`

#### State

Целевые сценарии:

1. `ru price changes with plan`
2. `ru price changes with currency`
3. `en price changes with plan`
4. `selected payment method is visually active`
5. `crypto selection updates control label or value`

### 3. E2E API

Это технический слой без UI.

Подслои:

- `network`
- `checkout-contract`

Целевые проверки:

1. `payment pages return expected status`
2. `redirects after submit point to expected provider domains`
3. `checkout url contains required params`
4. `provider host belongs to allowed list`

## Что считаем успешным E2E результатом

Для happy-path сценариев успехом считается:

1. после submit пользователь уходит с исходной формы;
2. открывается корректная payment/provider page;
3. URL принадлежит ожидаемому checkout/payment host.

Не считается успехом:

- отсутствие реакции после submit;
- открытие `failed` page;
- отсутствие заявленного способа оплаты;
- зависание на исходной форме без перехода.

Если это происходит, это считается найденным дефектом.

## Как трактуем найденные баги

Найденные баги:

- не прячем;
- не выносим в отдельную главную suite-модель;
- сохраняем в отчетах;
- описываем в findings/recommendations документе.

## Рабочие документы

- стратегический документ: [docs/e2e-test-strategy-ru.md](C:/Users/cbz_pc/free-vpn-planet-qa-tests/docs/e2e-test-strategy-ru.md)
- матрица сценариев: [docs/test-matrix-ru.md](C:/Users/cbz_pc/free-vpn-planet-qa-tests/docs/test-matrix-ru.md)
- описание текущего состояния тестов: [docs/tests-overview-ru.md](C:/Users/cbz_pc/free-vpn-planet-qa-tests/docs/tests-overview-ru.md)
- исходное задание: [TEST_ASSIGNMENT.md](C:/Users/cbz_pc/free-vpn-planet-qa-tests/TEST_ASSIGNMENT.md)

## Следующие шаги

1. утвердить итоговую матрицу сценариев;
2. удалить `known-issues` как отдельный suite;
3. перестроить тесты под `smoke + e2e-ui + e2e-api`;
4. перенести найденные баги в отдельное findings-описание;
5. обновить scripts, tags/projects и GitHub Actions под новую структуру.
