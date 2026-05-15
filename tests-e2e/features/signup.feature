Feature: Sign Up checkout
  Scenario: Successful signup reaches payment provider
    Given the visitor opens freevpnplanet.com
    When the visitor goes through Log In and Sign Up
    And fills the required data
    And selects a payment method
    Then the hosted payment page should open
