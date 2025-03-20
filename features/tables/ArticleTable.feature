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
        Examples:
            | selection | toggle | objectType | headerHeight | rowHeight |
            | 1         | 1      | 'Article'  | 'l'          | 'l'       |

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
            | column               | sortable | filterable | listFilter | width | flexible | showText | showIcon | type       | columnTitle | columnIcon | objectType |
            | 'Number'             | 1        | 1          | 0          | 60    | 0        | 1        | 0        | 'STRING'   | 1           | 0          | 'Article'  |
            | 'ArticleInformation' | 0        | 0          | 0          | 60    | 0        | 0        | 1        | 'STRING'   | 1           | 0          | 'Article'  |
            | 'SenderTypeID'       | 1        | 1          | 1          | 120   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Article'  |
            | 'From'               | 1        | 1          | 0          | 300   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Article'  |
            | 'CustomerVisible'    | 1        | 1          | 1          | 75    | 1        | 0        | 1        | 'STRING'   | 0           | 1          | 'Article'  |
            | 'ChannelID'          | 1        | 1          | 1          | 75    | 1        | 0        | 1        | 'STRING'   | 1           | 0          | 'Article'  |
            | 'Subject'            | 1        | 1          | 0          | 500   | 1        | 1        | 0        | 'STRING'   | 1           | 0          | 'Article'  |
            | 'IncomingTime'       | 1        | 1          | 0          | 125   | 1        | 1        | 0        | 'DATETIME' | 1           | 0          | 'Article'  |
            | 'Attachments'        | 0        | 0          | 0          | 75    | 0        | 1        | 1        | 'STRING'   | 1           | 0          | 'Article'  |