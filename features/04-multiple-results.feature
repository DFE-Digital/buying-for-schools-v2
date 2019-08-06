Feature: Multiple outcome page
  Scenario: Content on the multiple outcome page
    Given user is on page /find/type/on-going/services-categories/ict/ict-services/cloud
    Then the service displays the following page content
      | Heading | Matching frameworks                                                           |
      | Intro   | Based on your answers, there are multiple approved frameworks to choose from. |
    And have result card
      | Digital Marketplace (G-Cloud 11)                                                          |
      | CCS                                                                                       |
      | /find/type/on-going/services-categories/ict/ict-services/cloud/digital-marketplace  |
    And have result card
      | ICT, cloud, support and related services (Think IT)                                       |
      | E2BN                                                                                      |
      | /find/type/on-going/services-categories/ict/ict-services/cloud/ict-cloud            |