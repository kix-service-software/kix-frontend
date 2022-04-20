/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { ConfigItemTableContentProvider } from './ConfigItemTableContentProvider';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { DataType } from '../../../../../model/DataType';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ConfigItemDetailsContext } from '..';
import { ContextMode } from '../../../../../model/ContextMode';
import { SearchCache } from '../../../../search/model/SearchCache';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { Table } from '../../../../table/model/Table';
import { ToggleOptions } from '../../../../table/model/ToggleOptions';

export class ConfigItemTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration, contextId);
        table.setContentProvider(
            new ConfigItemTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        const tableColumns = this.getDefaultColumns();

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.CONFIG_ITEM, null, null, tableColumns, [],
                true, true, null, null, null, TableRowHeight.LARGE
            );
            defaultToggle = true;
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns?.length) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions(
                'config-item-version-details', 'configItem', [], false
            );
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.CONFIG_ITEM;
        return tableConfiguration;
    }

    private getDefaultColumns(): IColumnConfiguration[] {
        const tableColumns = [
            new DefaultColumnConfiguration(
                null, null, null, ConfigItemProperty.NUMBER, true, false, true, false, 135, true, true),
            new DefaultColumnConfiguration(
                null, null, null, ConfigItemProperty.NAME, true, false, true, false, 300, true, true),
            new DefaultColumnConfiguration(
                null, null, null,
                ConfigItemProperty.CUR_DEPL_STATE_ID, false, true, false, true, 55,
                true, true, true, DataType.STRING, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemProperty.CUR_INCI_STATE_ID, false, true, false, true, 55,
                true, true, true, DataType.STRING, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemProperty.CLASS_ID, true, false, true, false, 200, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemProperty.CHANGE_TIME, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, ConfigItemProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

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
}
