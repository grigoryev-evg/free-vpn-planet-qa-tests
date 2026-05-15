Feature: Personal VPN EN checkout
  Scenario: EN customer reaches payment provider
    Given the visitor opens personal.freevpnplanet.com
    When the visitor selects plan and payment method
    Then the hosted payment page should open
