Feature: Start pages


  Scenario: Content on the benefits/start page
    Given user is on page /
    Then the service displays the following page content
      | Heading | Find a DfE approved framework agreement for your school |
    And have links
      | Continue | /find |
      | See a list of all frameworks | /list |
