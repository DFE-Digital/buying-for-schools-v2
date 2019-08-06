Feature: All frameworks page
  Scenario: Content on the frameworks page
    Given user is on page /list
    Then the service displays the following page content
      | Heading | All frameworks |
    And have links
      | Books and related materials         | /list#category-books        |
      | Facilities management and estates   | /list#category-fm           |
      | ICT                                 | /list#category-ict          |
      | Legal                               | /list#category-legal        |
      | Professional                        | /list#category-professional |
      | Energy and utilities                | /list#category-energy       |
      | Financial                           | /list#category-financial    |
      | Recruitment and HR                  | /list#category-hr           |
      | Find a framework                    | /                                |

  Scenario: Framework page linked from list page
    Given user is on page /list/books
    Then the service displays the following page content
      | Heading | Books and related materials |
    And have links
      | Visit the ESPO website                          | https://www.espo.org/Pages/Books-for-schools-framework-376E-guide |
      
    