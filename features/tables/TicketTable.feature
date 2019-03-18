Feature: Als Nutzer möchte ich eine korrekte Standardkonfiguration für eine Tabelle erhalten

    Scenario Outline: Tabelle mit korrekter Konfiguration erstellen
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Examples:
            | selection | toggle | objectType |
            | 1         | 1      | 'Ticket'   |

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
            | 'PriorityID'    | 1        | 1          | 65    | 0        | 0        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Unseen'        | 1        | 0          | 41    | 0        | 0        | 1        | 'STRING'   | 0           | 0          | 'Ticket'   |
            | 'Watchers'      | 1        | 0          | 41    | 0        | 0        | 1        | 'STRING'   | 0           | 0          | 'Ticket'   |
            | 'TicketNumber'  | 1        | 1          | 135   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Title'         | 1        | 1          | 260   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'StateID'       | 1        | 1          | 80    | 1        | 0        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'LockID'        | 1        | 1          | 41    | 1        | 0        | 1        | 'STRING'   | 0           | 0          | 'Ticket'   |
            | 'QueueID'       | 1        | 1          | 100   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'ResponsibleID' | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'OwnerID'       | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'CustomerID'    | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Changed'       | 1        | 1          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Ticket'   |
            | 'Age'           | 1        | 1          | 75    | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Ticket'   |

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
            | column         | sortable | filterable | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'PriorityID'   | 1        | 1          | 65    | 0        | 0        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'TicketNumber' | 1        | 1          | 135   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Title'        | 1        | 1          | 160   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'StateID'      | 1        | 1          | 80    | 1        | 0        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'QueueID'      | 1        | 1          | 100   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'OwnerID'      | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'CustomerID'   | 1        | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Created'      | 1        | 1          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Ticket'   |
