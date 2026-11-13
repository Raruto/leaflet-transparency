Feature: Opacity control compatibility
  Scenario Outline: The opacity control works with supported Leaflet versions
    Then the "<bundle>" opacity control works with Leaflet "<version>"

    Examples:
      | bundle   | version      |
      | readable | 1.9.4        |
      | minified | 1.9.4        |
      | readable | 2.0.0-beta.3 |
      | minified | 2.0.0-beta.3 |
