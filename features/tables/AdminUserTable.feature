#
# Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
            | 1         | 0      | 'User'     | 'l'          | 'l'       | 17           |

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
            | column          | sortable | filterable | listFilter | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'UserLogin'     | 1        | 1          | 0          | 250   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'Lastname'      | 1        | 1          | 0          | 250   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'Firstname'     | 1        | 1          | 0          | 250   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'IsCustomer'    | 1        | 1          | 1          | 100   | 1        | 0        | 1        | 'STRING'   | 1           | 0          | 'Contact'  |
            | 'IsAgent'       | 1        | 1          | 1          | 100   | 1        | 0        | 1        | 'STRING'   | 1           | 0          | 'Contact'  |
            | 'Phone'         | 1        | 1          | 0          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'Mobile'        | 1        | 1          | 0          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'Email'         | 1        | 1          | 0          | 200   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'UserLastLogin' | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'User'     |
            | 'ValidID'       | 1        | 1          | 1          | 100   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'User'     |
            | 'CreateTime'    | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'User'     |
            | 'ChangeTime'    | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'User'     |
