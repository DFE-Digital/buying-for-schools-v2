Feature: Buying books

  Scenario: Content on the buying/services page
    Given user is on page /find/type
    Then the service displays the following page content
      | Heading | What are you buying?  |
      | submit  | Continue |
    And have radio buttons
      | Goods    | /find/type/buying   |
      | Services | /find/type/on-going |

  Scenario: Content on the buying what page
    Given user is on page /find/type/buying/what
    Then the service displays the following page content
      | Heading | What goods do you need? |
    And have radio buttons
      | Books and related materials | /find/type/buying/what/books-media |
      | Furniture                   | /find/type/buying/what/furniture   |
      | ICT                         | /find/type/buying/what/ict         |

  Scenario: Content on the books and related materials page
    Given user is on page /find/type/buying/what/books-media/class-library
    Then the service displays the following page content
      | Heading | What goods are you looking for in books and related materials? |
    And have radio buttons
      | Classroom supplies | /find/type/buying/what/books-media/class-library/classroom |
      | Library supplies   | /find/type/buying/what/books-media/class-library/library   |

  Scenario: Content on the classroom/books page
    Given user is on page /find/type/buying/what/books-media/class-library/classroom/books
    Then the service displays the following page content
      | Heading        | Books and related materials |
      | Recommendation | Based on your answers, we think you should use the Eastern Shires Purchasing Organisation (ESPO) framework. |
    And have links
      | Visit the ESPO website                                                      | https://www.espo.org/Pages/Books-for-schools-framework-376E-guide |
      | Buying for schools guidance                                                 | https://www.gov.uk/guidance/buying-for-schools |
      | Register for e-learning and information about the new Procurement Act 2023  | https://buyingforschools.blog.gov.uk/2024/11/19/update-for-schools-and-trusts-on-procurement-act-2023-are-you-ready/ |
      | Start again                                                                 | /find |
      | Change What are you buying?                                                 | /find/type |
      | Change What goods do you need?                                              | /find/type/buying/what |
      | Change What goods are you looking for in books and related materials?       | /find/type/buying/what/books-media/class-library |