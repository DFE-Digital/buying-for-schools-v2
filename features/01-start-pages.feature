Feature: Start pages


  Scenario: Content on the benefits/start page
    Given user is on page /
    Then the service displays the following page content
      | Heading | Why you should use a framework |
    And have links
      | Continue | /find |
