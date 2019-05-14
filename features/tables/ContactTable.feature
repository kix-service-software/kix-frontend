Feature: Als Nutzer möchte ich eine korrekte Standardkonfiguration für eine Tabelle erhalten

    Scenario Outline: Tabelle mit korrekter Konfiguration erstellen
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Examples:
            | selection | toggle | objectType |
            | 1         | 0      | 'Contact'  |

    Scenario Outline: Tabelle mit korrekter Spalte <column>
        Given Tabelle: <objectType>
        Then Die Spalte <column> muss sortierbar sein: <sortable>
        Then Die Spalte <column> muss filterbar sein: <filterable>
        Then Die Spalte <column> muss <width> breit sein
        Then Die Spalte <column> hat eine flexible Breite: <flexible>
        Then Die Spalte <column> zeigt Text an: <showText>
        Then Die Spalte <column> zeigt Icon an: <showIcon>
        Then Die Spalte <column> ist vom Type: <type>
        Then Die Spalte <column> zeigt Spaltenbezeichnung an: <columnTitle>
        Then Die Spalte <column> zeigt Spaltenicon an: <columnIcon>
        Examples:
            | column                  | sortable | filterable | width | flexible | showText | showIcon | type     | columnTitle | columnIcon | objectType |
            | 'Firstname'             | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Lastname'              | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Email'                 | 1        | 1          | 175   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Login'                 | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'PrimaryOrganisationID' | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Phone'                 | 1        | 1          | 130   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Country'               | 1        | 1          | 130   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'City'                  | 1        | 1          | 130   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Street'                | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'ValidID'               | 1        | 1          | 130   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |

    Scenario Outline: Tabelle - Schmal mit korrekter Spalte <column>
        Given Tabelle - Schmal: <objectType>
        Then Die Spalte <column> muss sortierbar sein: <sortable>
        Then Die Spalte <column> muss filterbar sein: <filterable>
        Then Die Spalte <column> muss <width> breit sein
        Then Die Spalte <column> hat eine flexible Breite: <flexible>
        Then Die Spalte <column> zeigt Text an: <showText>
        Then Die Spalte <column> zeigt Icon an: <showIcon>
        Then Die Spalte <column> ist vom Type: <type>
        Then Die Spalte <column> zeigt Spaltenbezeichnung an: <columnTitle>
        Then Die Spalte <column> zeigt Spaltenicon an: <columnIcon>
        Examples:
            | column                  | sortable | filterable | width | flexible | showText | showIcon | type     | columnTitle | columnIcon | objectType |
            | 'Firstname'             | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Lastname'              | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Email'                 | 1        | 1          | 175   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Login'                 | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'PrimaryOrganisationID' | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'City'                  | 1        | 1          | 130   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'Street'                | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
            | 'ValidID'               | 1        | 1          | 130   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Contact'  |
