Feature: Als Nutzer möchte ich eine korrekte Standardkonfiguration für eine Tabelle erhalten

    Scenario Outline: Tabelle mit korrekter Konfiguration erstellen
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Examples:
            | selection | toggle | objectType   |
            | 1         | 1      | 'ConfigItem' |

    Scenario Outline: Tabelle mit korrekter Spalte <column>
        Given Tabelle: <objectType>
        Then Die Spalte <column> muss sortierbar sein: <sortable>
        Then Die Spalte <column> muss filterbar sein: <filterable>
        Then Die Spalte <column> muss <width> breit betragen
        Then Die Spalte <column> hat eine flexible Breite: <flexible>
        Then Die Spalte <column> zeigt Text an: <showText>
        Then Die Spalte <column> zeigt Icon an: <showIcon>
        Then Die Spalte <column> ist vom Type: <type>
        Then Die Spalte <column> zeigt Spaltenbezeichnung an: <columnTitle>
        Then Die Spalte <column> zeigt Spaltenicon an: <columnIcon>
        Examples:
            | column           | sortable | filterable | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType   |
            | 'Number'         | 1        | 1          | 135   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
            | 'Name'           | 1        | 1          | 300   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
            | 'CurDeplStateID' | 1        | 1          | 55    | 0        | 0        | 1        | 'STRING'   | 0           | 1          | 'ConfigItem' |
            | 'CurInciStateID' | 1        | 1          | 55    | 0        | 0        | 1        | 'STRING'   | 0           | 1          | 'ConfigItem' |
            | 'ClassID'        | 1        | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
            | 'ChangeTime'     | 1        | 1          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'ConfigItem' |
            | 'ChangeBy'       | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |

    Scenario Outline: Tabelle - Schmal mit korrekter Spalte <column>
        Given Tabelle - Schmal: <objectType>
        Then Die Spalte <column> muss sortierbar sein: <sortable>
        Then Die Spalte <column> muss filterbar sein: <filterable>
        Then Die Spalte <column> muss <width> breit betragen
        Then Die Spalte <column> hat eine flexible Breite: <flexible>
        Then Die Spalte <column> zeigt Text an: <showText>
        Then Die Spalte <column> zeigt Icon an: <showIcon>
        Then Die Spalte <column> ist vom Type: <type>
        Then Die Spalte <column> zeigt Spaltenbezeichnung an: <columnTitle>
        Then Die Spalte <column> zeigt Spaltenicon an: <columnIcon>
        Examples:
            | column           | sortable | filterable | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType   |
            | 'Number'         | 1        | 1          | 135   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
            | 'Name'           | 1        | 1          | 300   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
            | 'CurDeplStateID' | 1        | 1          | 55    | 0        | 0        | 1        | 'STRING'   | 0           | 1          | 'ConfigItem' |
            | 'CurInciStateID' | 1        | 1          | 55    | 0        | 0        | 1        | 'STRING'   | 0           | 1          | 'ConfigItem' |
            | 'ClassID'        | 1        | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
            | 'ChangeTime'     | 1        | 1          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'ConfigItem' |
            | 'ChangeBy'       | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'ConfigItem' |
