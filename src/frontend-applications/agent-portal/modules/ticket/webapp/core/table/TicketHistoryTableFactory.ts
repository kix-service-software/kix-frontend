/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../base-components/webapp/core/table';
import { TicketHistoryContentProvider } from './TicketHistoryContentProvider';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { TicketHistoryProperty } from '../../../model/TicketHistoryProperty';
import { DataType } from '../../../../../model/DataType';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';

export class TicketHistoryTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TicketHistoryContentProvider(table, null, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                null, null, null, TicketHistoryProperty.HISTORY_TYPE, true, false, true, true, 200
            ),
            new DefaultColumnConfiguration(null, null, null, TicketHistoryProperty.NAME, true, false, true, true, 550),
            new DefaultColumnConfiguration(null, null, null,
                TicketHistoryProperty.CREATE_TIME, true, false, true, true, 150, true, false, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, TicketHistoryProperty.CREATE_BY, true, false, true, true, 300
            ),
            new DefaultColumnConfiguration(null, null, null,
                TicketHistoryProperty.ARTICLE_ID, true, true, false, false, 150,
                false, false, false, DataType.STRING, true, 'go-to-article-cell'
            ),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.TICKET_HISTORY, null, null, tableColumns, [], null, null, null, null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

}
