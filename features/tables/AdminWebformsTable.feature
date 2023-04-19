#
# Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
# --
# This software comes with ABSOLUTELY NO WARRANTY. For details, see
# the enclosed file LICENSE for license information (GPL3). If you
# did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
# --
#

Feature: As a user I want to get a correct default configuration of a table

    Scenario Outline: Create a table with default configuration
        Given Tabelle: <objectType>
        Then Selection: <selection>
        Then Toggle: <toggle>
        Then Kopfzeilengröße: <headerHeight>
        Then Zeilengröße: <rowHeight>
        Then DisplayLimit: <displayLimit>
        Examples:
            | selection | toggle | objectType | headerHeight | rowHeight | displayLimit |
            | 1         | 1      | 'WEBFORM'  | 'l'          | 'l'       | 20           |

    Scenario Outline: Table column <column>
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
            | column        | sortable | filterable | listFilter | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'title'       | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'QueueID'     | 1        | 1          | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'PrioritiyID' | 1        | 1          | 1          | 80    | 0        | 0        | 1        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'TypeID'      | 1        | 1          | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'StateID'     | 1        | 1          | 1          | 120   | 1        | 1        | 1        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'ValidID'     | 1        | 1          | 1          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'ChangeTime'  | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'WEBFORM'  |
            | 'ChangeBy'    | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'WEBFORM'  |
            | 'CreateTime'  | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'WEBFORM'  |
            | 'CreateBy'    | 1        | 1          | 0          | 150   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'WEBFORM'  |