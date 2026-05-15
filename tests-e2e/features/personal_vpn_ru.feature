Feature: Personal VPN RU checkout
  Scenario: RU customer reaches payment provider
    Given the visitor opens planetconfig.com
    When the visitor selects plan and payment method
    Then the hosted payment page should open
