Feature: Unavailable
  Scenario Outline: Unavailable
    Given the service is unavailable
    And user is on page <page>
    Then the service displays the following page content
      | Heading | Sorry, the service is unavailable |
    And the page title is 'Sorry, the service is unavailable'
  Examples:
    | page                                                                    |
    | /                                                                       |
    | /benefits                                                               |
    | /selection                                                              |
    | /service-output                                                         |
    | /find/type/buying/what                                            |
    | /find/type/buying/what/books-media/class-library/classroom/books  |
    | /find/type/on-going/services-categories/ict/ict-services/cloud    |
    | /list                                                              |
    | /list/furniture                                                    |
    | /collection                                                             |
    | /guidance/books                                                         |