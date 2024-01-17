/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TicketTableContentProvider } from '.';
import { TicketProperty } from '../../../model/TicketProperty';
import { DataType } from '../../../../../model/DataType';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { TicketDetailsContext } from '..';
import { ContextMode } from '../../../../../model/ContextMode';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { SearchCache } from '../../../../search/model/SearchCache';
import { Table } from '../../../../table/model/Table';
import { ToggleOptions } from '../../../../table/model/ToggleOptions';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';

export class TicketTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[],
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType | string, objects?: KIXObject[]
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration, contextId);

        const contentProvider = new TicketTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId, objects
        );

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        const tableColumns = this.getDefaultColumns(short);

        let useDefaultColumns: boolean = false;
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                null, null, null, KIXObjectType.TICKET, null, null, tableColumns, [], true);
            defaultToggle = true;
            useDefaultColumns = true;
        } else if (!tableConfiguration.tableColumns || !tableConfiguration.tableColumns.length) {
            tableConfiguration.tableColumns = tableColumns;
            useDefaultColumns = true;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID
            );
        }
        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('ticket-article-details', 'article', [], false);
        }

        tableConfiguration.objectType = KIXObjectType.TICKET;

        for (const extendedFactory of this.extendedTableFactories) {
            extendedFactory.modifiyTableConfiguation(tableConfiguration, useDefaultColumns);
        }
        this.addIncludesIfNeeded(tableConfiguration);

        return tableConfiguration;
    }

    private getDefaultColumns(short?: boolean): IColumnConfiguration[] {
        let tableColumns: IColumnConfiguration[];
        if (short) {
            tableColumns = [
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.TICKET_NUMBER, true, false, true, false, 135, true, true, false,
                    undefined, true, undefined, undefined, false
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.TITLE, true, false, true, false, 160, true, true, false,
                    undefined, true, undefined, undefined, false
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.STATE_ID, true, true, true, false, 150, true, true, true),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.QUEUE_ID, true, false, true, false, 100, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.OWNER_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.ORGANISATION_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.CREATED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                )
            ];
        } else {
            tableColumns = [
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.PRIORITY_ID, false, true, true, false, 65, true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.UNSEEN, false, true, false, false, 41, true, false, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.WATCHER_ID, false, true, false, false, 41, true, false, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.TICKET_NUMBER, true, false, true, false, 135, true, true
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.TITLE, true, false, true, false, 260, true, true, false,
                    DataType.STRING, true, null, null, false
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.STATE_ID, true, true, true, false, 150, true, true, true
                ),
                new DefaultColumnConfiguration(
                    null, null, null, TicketProperty.LOCK_ID, false, true, false, false, 41, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.QUEUE_ID, true, false, true, false, 100, true, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.RESPONSIBLE_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.OWNER_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.ORGANISATION_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.CHANGED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                ),
                new DefaultColumnConfiguration(null, null, null,
                    TicketProperty.AGE, true, false, true, false, 90, true, true, false, DataType.NUMBER
                )
            ];
        }

        return tableColumns;
    }

    public async getDefaultColumnConfigurations(searchCache: SearchCache): Promise<IColumnConfiguration[]> {
        const superColumns = await super.getDefaultColumnConfigurations(searchCache);
        const ticketColumns = this.getDefaultColumns();
        return [
            ...ticketColumns,
            ...superColumns.filter((c) => !ticketColumns.some((tc) => tc.property === c.property))
        ];
    }

    public getDefaultColumnConfiguration(property: string, translatable?: boolean): IColumnConfiguration {
        let config: IColumnConfiguration;
        if (property === TicketProperty.PENDING_TIME) {
            config = new DefaultColumnConfiguration(null, null, null,
                TicketProperty.PENDING_TIME, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
            );
        }

        if (!config) {
            config = super.getDefaultColumnConfiguration(property, translatable);
        }

        return config;
    }

    private addIncludesIfNeeded(tableConfiguration: TableConfiguration): void {
        if (
            tableConfiguration.tableColumns.some((c) => c.property === TicketProperty.UNSEEN)
        ) {
            if (!tableConfiguration.loadingOptions) {
                tableConfiguration.loadingOptions = new KIXObjectLoadingOptions();
            }
            if (!tableConfiguration.loadingOptions.includes) {
                tableConfiguration.loadingOptions.includes = [];
            }
            if (!tableConfiguration.loadingOptions.includes?.some((i) => i === TicketProperty.UNSEEN)) {
                tableConfiguration.loadingOptions.includes.push(TicketProperty.UNSEEN);
            }
        }

        const watcherColumn = tableConfiguration.tableColumns.find(
            (c) => c.property === TicketProperty.WATCHERS || c.property === TicketProperty.WATCHER_ID
        );
        if (watcherColumn) {
            // make sure correct property is used (prevent including watchers)
            watcherColumn.property = TicketProperty.WATCHER_ID;

            if (!tableConfiguration.loadingOptions) {
                tableConfiguration.loadingOptions = new KIXObjectLoadingOptions();
            }
            if (!tableConfiguration.loadingOptions.includes) {
                tableConfiguration.loadingOptions.includes = [];
            }
            if (!tableConfiguration.loadingOptions.includes?.some((i) => i === TicketProperty.WATCHER_ID)) {
                tableConfiguration.loadingOptions.includes.push(TicketProperty.WATCHER_ID);
            }
        }
    }

}
