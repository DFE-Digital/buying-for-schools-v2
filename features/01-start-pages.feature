Feature: Start pages


  Scenario: Content on the benefits/start page
    Given user is on page /
    Then the service displays the following page content
      | Heading | Find a DfE approved framework agreement for your school |
    And have links
      | Continue | /find |
      | See a list of all frameworks                                                | /list |
      | See a list of all frameworks                                                | /list |
      | Register for e-learning and information about the new procurement Act 2023  | https://buyingforschools.blog.gov.uk/2024/11/19/update-for-schools-and-trusts-on-procurement-act-2023-are-you-ready/ |
