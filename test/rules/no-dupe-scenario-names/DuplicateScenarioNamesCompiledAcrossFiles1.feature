Feature: This is a Feature with non unique scenario names in pickles across multiple files

  Background:
    Given I have a Background

  Scenario Outline: This is a Scenario Outline parametrized: <foo>
    Then this is a then step <foo>
    Examples:
      | foo |
      | bar |

    Rule: A Rule
      Scenario Outline: This is a Scenario Outline parametrized: <foo>
        Then this is a then step <foo>
        Examples:
          | foo |
          | bar |
