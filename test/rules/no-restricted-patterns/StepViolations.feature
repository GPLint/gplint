Feature: No restricted patterns
  No restricted patterns

  Scenario: Disallowed exact and partial matching
  A bad description
    Given a bad step given
    And a restricted global pattern
    When a pattern step incorrect
    And bad step when
    Then allowed step
    And bad step incorrect then
    And allowed step with invalid docstring
    """
    a disallowed docstring
    """
    And allowed step with invalid table
      | allowed cell | disallowed cell |
