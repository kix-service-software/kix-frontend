/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { QueueDetailsContext } from '../../context';
import { TableFactory } from '../../../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../../model/configuration/TableConfiguration';
import { TicketQueueTableContentProvider } from './TicketQueueTableContentProvider';
import { QueueProperty } from '../../../../../model/QueueProperty';
import { KIXObjectProperty } from '../../../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../../../model/DataType';
import { Table } from '../../../../../../table/model/Table';

export class TicketQueueTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.QUEUE;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new TicketQueueTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        );

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(QueueProperty.NAME),
            this.getDefaultColumnConfiguration(QueueProperty.QUEUE_ID),
            this.getDefaultColumnConfiguration(QueueProperty.FOLLOW_UP_ID),
            this.getDefaultColumnConfiguration(QueueProperty.UNLOCK_TIMEOUT),
            this.getDefaultColumnConfiguration(QueueProperty.SYSTEM_ADDRESS_ID),
            this.getDefaultColumnConfiguration(QueueProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.QUEUE, null, 20, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                QueueDetailsContext.CONTEXT_ID, KIXObjectType.QUEUE,
                ContextMode.DETAILS, QueueProperty.QUEUE_ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case QueueProperty.NAME:
            case QueueProperty.SYSTEM_ADDRESS_ID:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case QueueProperty.FOLLOW_UP_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, true);
                break;
            case QueueProperty.UNLOCK_TIMEOUT:
                config = new DefaultColumnConfiguration(null, null, null,
                    property, true, false, true, false, 150, true, true, false, DataType.NUMBER
                );
                break;
            case QueueProperty.QUEUE_ID:
                config = super.getDefaultColumnConfiguration('ICON');
                config.property = QueueProperty.QUEUE_ID;
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
