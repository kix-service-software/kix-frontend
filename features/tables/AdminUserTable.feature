Feature: Als Nutzer möchte ich eine korrekte Standardkonfiguration für eine Tabelle erhalten

    Scenario Outline: Tabelle mit korrekter Konfiguration erstellen
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Examples:
            | selection | toggle | objectType |
            | 1         | 0      | 'User'     |

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
            | column          | sortable | filterable | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'UserLogin'     | 1        | 1          | 250   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserLastname'  | 1        | 1          | 250   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserFirstname' | 1        | 1          | 250   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserPhone'     | 1        | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserMobile'    | 1        | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserEmail'     | 1        | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserLastLogin' | 1        | 1          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'User'     |
            | 'ValidID'       | 1        | 1          | 100   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'CreateTime'    | 1        | 1          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'User'     |
            | 'ChangeTime'    | 1        | 1          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'User'     |
