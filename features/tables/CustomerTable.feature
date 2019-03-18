Feature: Als Nutzer möchte ich eine korrekte Standardkonfiguration für eine Tabelle erhalten

    Scenario Outline: Tabelle mit korrekter Konfiguration erstellen
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Examples:
            | selection | toggle | objectType |
            | 1         | 0      | 'Customer' |

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
            | column                   | sortable | filterable | width | flexible | showText | showIcon | type     | columnTitle | columnIcon | objectType |
            | 'CustomerID'             | 1        | 1          | 230   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Customer' |
            | 'CustomerCompanyName'    | 1        | 1          | 350   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Customer' |
            | 'CustomerCompanyCountry' | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Customer' |
            | 'CustomerCompanyCity'    | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Customer' |
            | 'CustomerCompanyStreet'  | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Customer' |
            | 'ValidID'                | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING' | 1           | 0          | 'Customer' |