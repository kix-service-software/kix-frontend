#
# Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file LICENSE for license information (GPL3). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --
#

Feature: Als Nutzer möchte ich eine korrekte Standardkonfiguration für eine Tabelle erhalten

    Scenario Outline: Tabelle mit korrekter Konfiguration erstellen
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Then Kopfzeilengröße: <headerHeight>
        Then Zeilengröße: <rowHeight>
        Then DisplayLimit: <displayLimit>
        Examples:
            | selection | toggle | objectType | headerHeight | rowHeight | displayLimit |
            | 1         | 1      | 'Ticket'   | 'l'          | 's'       | 10           |

    Scenario Outline: Tabelle mit korrekter Spalte <column>
        Given Tabelle: <objectType>
        Then Die Spalte <column> muss sortierbar sein: <sortable>
        Then Die Spalte <column> muss filterbar sein: <filterable>
        Then Die Spalte <column> hat einen diskreten Filter: <listFilter>
        Then Die Spalte <column> muss <width> breit sein
        Then Die Spalte <column> hat eine flexible Breite: <flexible>
        Then Die Spalte <column> zeigt Text an: <showText>
        Then Die Spalte <column> zeigt Icon an: <showIcon>
        Then Die Spalte <column> ist vom Typ: <type>
        Then Die Spalte <column> zeigt Spaltenbezeichnung an: <columnTitle>
        Then Die Spalte <column> zeigt Spaltenicon an: <columnIcon>
        Examples:
            | column           | sortable | filterable | listFilter | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'PriorityID'     | 1        | 1          | 1          | 65    | 0        | 0        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Unseen'         | 1        | 0          | 0          | 41    | 0        | 0        | 1        | 'STRING'   | 0           | 0          | 'Ticket'   |
            | 'Watchers'       | 1        | 0          | 0          | 41    | 0        | 0        | 1        | 'STRING'   | 0           | 0          | 'Ticket'   |
            | 'TicketNumber'   | 1        | 1          | 0          | 135   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Title'          | 1        | 1          | 0          | 260   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'StateID'        | 1        | 1          | 1          | 150   | 1        | 1        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'LockID'         | 1        | 1          | 1          | 41    | 1        | 0        | 1        | 'STRING'   | 0           | 0          | 'Ticket'   |
            | 'QueueID'        | 1        | 1          | 1          | 100   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            # | 'DynamicFields.AffectedAsset' | 1        | 1          | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'ResponsibleID'  | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'OwnerID'        | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'OrganisationID' | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Changed'        | 1        | 1          | 0          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Ticket'   |
            | 'Age'            | 1        | 1          | 0          | 90    | 1        | 1        | 0        | 'NUMBER'   | 1           | 0          | 'Ticket'   |

    Scenario Outline: Tabelle - Schmal mit korrekter Spalte <column>
        Given Tabelle - Schmal: <objectType>
        Then Die Spalte <column> muss sortierbar sein: <sortable>
        Then Die Spalte <column> muss filterbar sein: <filterable>
        Then Die Spalte <column> hat einen diskreten Filter: <listFilter>
        Then Die Spalte <column> muss <width> breit sein
        Then Die Spalte <column> hat eine flexible Breite: <flexible>
        Then Die Spalte <column> zeigt Text an: <showText>
        Then Die Spalte <column> zeigt Icon an: <showIcon>
        Then Die Spalte <column> ist vom Typ: <type>
        Then Die Spalte <column> zeigt Spaltenbezeichnung an: <columnTitle>
        Then Die Spalte <column> zeigt Spaltenicon an: <columnIcon>
        Examples:
            | column           | sortable | filterable | listFilter | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'PriorityID'     | 1        | 1          | 1          | 65    | 0        | 0        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'TicketNumber'   | 1        | 1          | 0          | 135   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Title'          | 1        | 1          | 0          | 160   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'StateID'        | 1        | 1          | 1          | 150   | 1        | 1        | 1        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'QueueID'        | 1        | 1          | 1          | 100   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            # | 'DynamicFields.AffectedAsset' | 1        | 1          | 1          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'OwnerID'        | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'OrganisationID' | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Ticket'   |
            | 'Created'        | 1        | 1          | 0          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Ticket'   |
