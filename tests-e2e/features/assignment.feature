Feature: Assignment — позитивные E2E checkout сценарии (тестовое задание)

  Background:
    Given браузер с чистым профилем (без cookies/localStorage)
    And сайт доступен по HTTPS

  # === Sign Up ===

  @assignment @smoke
  Scenario: TC_ASSIGN_001 — Sign Up (RU) + monthly + card → hosted checkout
    Given пользователь открыл https://freevpnplanet.com
    When перешёл на страницу регистрации "/signup"
    And заполнил email (уникальный, test+...@example.com)
    And заполнил пароль (из SIGNUP_PASSWORD)
    And нажал "Next" / "Continue"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "bank card"
    And принял условия (чекбокс)
    And нажал "Pay" / "Submit"
    Then открылась hosted-страница платёжного провайдера (stripe.com / cloudpayments.ru / etc.)

  # === Personal VPN RU ===

  @assignment @smoke
  Scenario: TC_ASSIGN_002 — Personal VPN RU + monthly + card → hosted checkout
    Given пользователь открыл https://planetconfig.com (RU-версия)
    When выбрал локацию "Netherlands"
    And выбрал валюту "RUB"
    And выбрал план "monthly" (1 месяц)
    And заполнил email (уникальный)
    And нажал "Continue" / "Далее"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "bank card"
    And принял условия
    And нажал "Pay"
    Then открылась hosted-страница платёжного провайдера

  @assignment @smoke
  Scenario: TC_ASSIGN_003 — Personal VPN RU + monthly + crypto → hosted checkout
    Given пользователь открыл https://planetconfig.com (RU-версия)
    When выбрал локацию "Netherlands"
    And выбрал валюту "RUB"
    And выбрал план "monthly"
    And заполнил email (уникальный)
    And нажал "Continue"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "cryptocurrency"
    And принял условия
    And нажал "Pay"
    Then открылась hosted-страница крипто-провайдера (coinbase.com / etc.)

  @assignment
  Scenario: TC_ASSIGN_004 — Personal VPN RU + yearly + card → hosted checkout
    Given пользователь открыл https://planetconfig.com (RU-версия)
    When выбрал локацию "Netherlands"
    And выбрал валюту "RUB"
    And выбрал план "yearly" (1 год)
    And заполнил email (уникальный)
    And нажал "Continue"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "bank card"
    And принял условия
    And нажал "Pay"
    Then открылась hosted-страница платёжного провайдера

  # === Personal VPN EN ===

  @assignment @smoke
  Scenario: TC_ASSIGN_005 — Personal VPN EN + monthly + card → hosted checkout
    Given пользователь открыл https://personal.freevpnplanet.com (EN-версия)
    When выбрал план "1 month"
    And заполнил email (уникальный)
    And нажал "Continue"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "bank card"
    And принял условия
    And нажал "Pay"
    Then открылась hosted-страница платёжного провайдера

  @assignment
  Scenario: TC_ASSIGN_006 — Personal VPN EN + monthly + crypto → hosted checkout
    Given пользователь открыл https://personal.freevpnplanet.com (EN-версия)
    When выбрал план "1 month"
    And заполнил email (уникальный)
    And нажал "Continue"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "cryptocurrency"
    And принял условия
    And нажал "Pay"
    Then открылась hosted-страница крипто-провайдера

  @assignment
  Scenario: TC_ASSIGN_007 — Personal VPN EN + yearly + card → hosted checkout
    Given пользователь открыл https://personal.freevpnplanet.com (EN-версия)
    When выбрал план "1 year"
    And заполнил email (уникальный)
    And нажал "Continue"
    Then открылся шаг выбора способа оплаты
    When выбрал способ оплаты "bank card"
    And принял условия
    And нажал "Pay"
    Then открылась hosted-страница платёжного провайдера