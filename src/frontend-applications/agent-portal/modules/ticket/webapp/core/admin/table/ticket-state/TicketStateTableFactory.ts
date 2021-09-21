/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../../../base-components/webapp/core/table';
import { TicketStateTableContentProvider } from './TicketStateTableContentProvider';
import { TicketStateProperty } from '../../../../../model/TicketStateProperty';
import { KIXObjectProperty } from '../../../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../../../model/configuration/RoutingConfiguration';
import { TicketStateDetailsContext } from '../..';
import { ContextMode } from '../../../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../../../model/configuration/IColumnConfiguration';
import {
    DefaultColumnConfiguration
} from '../../../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../../../model/DataType';

export class TicketStateTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new TicketStateTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(TicketStateProperty.NAME),
            this.getDefaultColumnConfiguration(TicketStateProperty.ID),
            this.getDefaultColumnConfiguration(TicketStateProperty.TYPE_NAME),
            this.getDefaultColumnConfiguration(TicketStateProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.TICKET_STATE, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                TicketStateDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_STATE,
                ContextMode.DETAILS, TicketStateProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case TicketStateProperty.NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case TicketStateProperty.TYPE_NAME:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, true, true,
                    DataType.STRING, true, null, null, false
                );
                break;
            case TicketStateProperty.ID:
                config = super.getDefaultColumnConfiguration('ICON');
                config.property = TicketStateProperty.ID;
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
