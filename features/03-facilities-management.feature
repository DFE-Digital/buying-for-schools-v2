Feature: Facilities management

  Scenario: Content on the services-categories page
    Given user is on page /find/type/on-going/services-categories
    Then the service displays the following page content
      | Heading | What services do you need?  |
      | submit  | Continue                    |
    And have radio buttons
      | Energy and utilities              | /find/type/on-going/services-categories/energy        |
      | Facilities management and estates | /find/type/on-going/services-categories/facilities    |
      | Financial                         | /find/type/on-going/services-categories/financial     |
      | ICT                               | /find/type/on-going/services-categories/ict           |
      | Legal                             | /find/type/on-going/services-categories/legal         |
      | Professional                      | /find/type/on-going/services-categories/professional  |
      | Recruitment and HR                | /find/type/on-going/services-categories/recruitment   |

  Scenario: Content on the fm-categories page
    Given user is on page /find/type/on-going/services-categories/facilities/fm-categories
    Then the service displays the following page content
      | Heading | What services are you looking for in facilities management and estates?  |
      | submit  | Continue |
    And have radio buttons
      | Catering                          | /find/type/on-going/services-categories/facilities/fm-categories/catering           |
      | Cleaning                          | /find/type/on-going/services-categories/facilities/fm-categories/support            |
      | Construction consultancy          | /find/type/on-going/services-categories/facilities/fm-categories/construction       |
      | Grounds maintenance               | /find/type/on-going/services-categories/facilities/fm-categories/grounds            |
      | Maintenance                       | /find/type/on-going/services-categories/facilities/fm-categories/maintenance        |
      | Removal and relocation            | /find/type/on-going/services-categories/facilities/fm-categories/removal-relocation |
      | Security                          | /find/type/on-going/services-categories/facilities/fm-categories/security           |
      | Total facilities management       | /find/type/on-going/services-categories/facilities/fm-categories/tfm                |
      | Waste                             | /find/type/on-going/services-categories/facilities/fm-categories/waste              |