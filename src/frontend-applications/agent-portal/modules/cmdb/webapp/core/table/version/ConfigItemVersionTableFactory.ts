/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../../model/configuration/TableConfiguration';
import { ConfigItemVersionContentProvider } from '.';
import { DefaultColumnConfiguration } from '../../../../../../model/configuration/DefaultColumnConfiguration';
import { VersionProperty } from '../../../../model/VersionProperty';
import { DataType } from '../../../../../../model/DataType';
import { TableHeaderHeight } from '../../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../../model/configuration/TableRowHeight';
import { Table } from '../../../../../table/model/Table';
import { ToggleOptions } from '../../../../../table/model/ToggleOptions';

export class ConfigItemVersionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new ConfigItemVersionContentProvider(table, null, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                null, null, null, VersionProperty.COUNT_NUMBER, true, false, true, true, 120),
            new DefaultColumnConfiguration(null, null, null,
                VersionProperty.CREATE_TIME, true, false, true, true, 150, true, false, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(null, null, null, VersionProperty.CREATE_BY, true, false, true, true, 200),
            new DefaultColumnConfiguration(
                null, null, null, VersionProperty.BASED_ON_CLASS_VERSION, true, false, true, false, 300, false)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.CONFIG_ITEM_VERSION, null, undefined, tableColumns, [], true, true, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultToggle = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('config-item-version-details', 'version', [
                'config-item-version-maximize-action'
            ], true);
        }

        return tableConfiguration;
    }

}
