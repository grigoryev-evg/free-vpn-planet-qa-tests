# Матрица тестовых сценариев

Этот файл фиксирует целевую матрицу тестов для проекта.

Он нужен, чтобы:

- отделить обязательное покрытие задания от расширенного покрытия;
- договориться о составе `smoke`, `e2e-ui` и `e2e-api`;
- определить приоритеты реализации;
- понимать, какие сценарии являются позитивными, а какие негативными;
- использовать документ как основу для рефакторинга тестов, scripts и CI.

## Легенда

- `Suite` — тестовый слой.
- `Type` — характер сценария: `positive`, `negative`, `state`, `technical`.
- `Priority`:
  - `P0` — ядро задания, нужно реализовать в первую очередь;
  - `P1` — сильное расширение покрытия, желательно для хорошей подачи;
  - `P2` — дополнительный инженерный слой, делаем после базового E2E UI.
- `Covers assignment`:
  - `yes` — напрямую покрывает текст тестового задания;
  - `partial` — косвенно усиливает покрытие, но не является прямым требованием;
  - `no` — техническое или аналитическое расширение.

---

## 1. Smoke

| ID | Suite | Scenario | Type | Priority | Covers assignment | Expected result |
|---|---|---|---|---|---|---|
| SMK-001 | smoke | Signup basic | positive | P0 | yes | Пользователь доходит до шага выбора способа оплаты, отображаются payment methods и кнопка продолжения |
| SMK-002 | smoke | Personal VPN RU basic | positive | P0 | yes | Пользователь доходит до страницы выбора способа оплаты, видны card и crypto опции |
| SMK-003 | smoke | Personal VPN EN basic | positive | P0 | yes | Пользователь доходит до страницы выбора способа оплаты для месячного плана, видны card и crypto опции |

### Назначение smoke

`smoke` не должен глубоко проверять checkout-провайдеров и не должен разрастаться.  
Это короткий демонстрационный слой, который:

- быстро гоняется локально;
- используется как основной ручной прогон в GitHub Actions;
- показывает, что ключевые funnel живы.

---

## 2. E2E UI Happy-path

| ID | Suite | Scenario | Type | Priority | Covers assignment | Expected result |
|---|---|---|---|---|---|---|
| HP-001 | e2e-ui/happy-path | Signup -> card -> Get your subscription | positive | P0 | yes | После submit открывается корректная payment/provider page |
| HP-002 | e2e-ui/happy-path | RU -> month -> card | positive | P0 | yes | После выбора card и submit открывается корректная payment/provider page |
| HP-003 | e2e-ui/happy-path | RU -> month -> crypto | positive | P0 | yes | После выбора crypto и submit открывается корректная payment/provider page |
| HP-004 | e2e-ui/happy-path | EN -> month -> card | positive | P0 | yes | После выбора card и submit открывается корректная payment/provider page |
| HP-005 | e2e-ui/happy-path | EN -> month -> crypto | positive | P0 | yes | После выбора crypto и submit открывается корректная payment/provider page |
| HP-006 | e2e-ui/happy-path | EN -> year -> card | positive | P0 | yes | После выбора yearly plan и card открывается корректная payment/provider page |
| HP-007 | e2e-ui/happy-path | EN -> year -> crypto | positive | P0 | yes | После выбора yearly plan и crypto открывается корректная payment/provider page |

### Комментарий по happy-path

Это ядро тестового задания.  
Если какие-то из этих сценариев падают на продуктовых дефектах, это нормально как результат тестирования, но сами сценарии должны существовать именно здесь, а не в отдельном `known-issues`.

---

## 3. E2E UI Validation

| ID | Suite | Scenario | Type | Priority | Covers assignment | Expected result |
|---|---|---|---|---|---|---|
| VAL-001 | e2e-ui/validation | Signup with invalid email | negative | P1 | partial | Пользователь не может продолжить flow, отображается ошибка или кнопка остается неактивной |
| VAL-002 | e2e-ui/validation | Signup with empty email | negative | P1 | partial | Переход к следующему шагу невозможен |
| VAL-003 | e2e-ui/validation | Signup without terms | negative | P1 | partial | Submit на оплату невозможен без принятия условий |
| VAL-004 | e2e-ui/validation | RU with empty email | negative | P1 | partial | Пользователь не может перейти к payment methods |
| VAL-005 | e2e-ui/validation | RU with invalid email | negative | P1 | partial | Переход к оплате блокируется, отображается валидация |
| VAL-006 | e2e-ui/validation | RU without terms | negative | P1 | partial | Оплата не должна стартовать без принятия условий |
| VAL-007 | e2e-ui/validation | EN with empty email | negative | P1 | partial | Пользователь не может перейти к payment methods |
| VAL-008 | e2e-ui/validation | EN with invalid email | negative | P1 | partial | Переход к оплате блокируется, отображается валидация |
| VAL-009 | e2e-ui/validation | EN without terms | negative | P1 | partial | Оплата не должна стартовать без принятия условий |

### Зачем validation нужен

Формально это не основное требование задания, но это сильно усиливает проект:

- показывает понимание негативных веток;
- помогает находить реальные UX и form-validation defects;
- делает набор ближе к практической QA-автоматизации, а не только к happy-path демонстрации.

---

## 4. E2E UI State

| ID | Suite | Scenario | Type | Priority | Covers assignment | Expected result |
|---|---|---|---|---|---|---|
| ST-001 | e2e-ui/state | RU price changes when plan changes | state | P1 | partial | При смене плана меняется summary/price |
| ST-002 | e2e-ui/state | RU price changes when currency changes | state | P1 | partial | При смене валюты меняется summary/price |
| ST-003 | e2e-ui/state | EN price changes when plan changes | state | P1 | partial | При смене плана меняется summary/price |
| ST-004 | e2e-ui/state | Selected payment method becomes visually active | state | P1 | partial | После выбора метода оплаты UI явно показывает active state |
| ST-005 | e2e-ui/state | Crypto selection updates visible label/value | state | P1 | partial | После выбора криптовалюты control/label отражает выбранное значение |

### Зачем state-проверки нужны

Они закрывают динамическое поведение интерфейса, которое часто ломается раньше финального checkout:

- summary;
- price recalculation;
- selected state;
- переключение методов оплаты;
- корректность crypto selector.

---

## 5. E2E API / Technical

| ID | Suite | Scenario | Type | Priority | Covers assignment | Expected result |
|---|---|---|---|---|---|---|
| API-001 | e2e-api/network | Payment-related pages return expected status | technical | P2 | no | Ключевые страницы и endpoints не отдают 5xx на базовых запросах |
| API-002 | e2e-api/checkout-contract | Redirect after submit points to allowed provider domain | technical | P2 | partial | Redirect указывает на ожидаемый provider host |
| API-003 | e2e-api/checkout-contract | Checkout URL contains required parameters | technical | P2 | partial | URL/redirect содержит признаки корректно сформированного заказа |
| API-004 | e2e-api/checkout-contract | Provider host belongs to approved list | technical | P2 | partial | Host платежного провайдера входит в заранее определенный whitelist |

### Роль e2e-api

Этот слой полезен, но он не должен блокировать начало работ по UI.

Правильный порядок реализации:

1. `smoke`
2. `e2e-ui happy-path`
3. `e2e-ui validation`
4. `e2e-ui state`
5. `e2e-api`

---

## 6. Что идет в первую волну реализации

### Обязательная первая волна

1. `SMK-001`
2. `SMK-002`
3. `SMK-003`
4. `HP-001`
5. `HP-002`
6. `HP-003`
7. `HP-004`
8. `HP-005`
9. `HP-006`
10. `HP-007`

Это минимально серьезный набор, который прямо соответствует тестовому заданию.

### Вторая волна

1. `VAL-001` ... `VAL-009`
2. `ST-001` ... `ST-005`

Это усиление проекта в сторону полноценной QA-автоматизации.

### Третья волна

1. `API-001` ... `API-004`

Это техническое расширение и хороший бонус, но не стартовая необходимость.

---

## 7. Что убираем из целевой модели

Из целевой модели убирается отдельный suite `known-issues`.

Причина:

- он размывает основную структуру проекта;
- создает ложное ощущение отдельной дефектной ветки вместо основного E2E слоя;
- найденные баги должны выявляться обычными тестами и описываться в findings-документе.

---

## 8. Итоговое решение по структуре

Целевой вид проекта:

- `smoke`
- `e2e-ui`
  - `happy-path`
  - `validation`
  - `state`
- `e2e-api`
  - `network`
  - `checkout-contract`

Следующая практическая работа по проекту должна идти уже по этой матрице.
