#
# Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
            | 1         | 0      | 'Queue'    | 'l'          | 'l'       | 20           |

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
            | column            | sortable | filterable | listFilter | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'Name'            | 1        | 1          | 0          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
            | 'QueueID'         | 0        | 0          | 0          | 41    | 0        | 0        | 1        | 'STRING'   | 0           | 0          | 'Queue'    |
            | 'FollowUpID'      | 1        | 1          | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
            | 'UnlockTimeout'   | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'NUMBER'   | 1           | 0          | 'Queue'    |
            | 'SystemAddressID' | 1        | 1          | 0          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
            | 'Comment'         | 1        | 1          | 0          | 350   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
            | 'ValidID'         | 1        | 1          | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
            | 'CreateTime'      | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Queue'    |
            | 'CreateBy'        | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
            | 'ChangeTime'      | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Queue'    |
            | 'ChangeBy'        | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Queue'    |
