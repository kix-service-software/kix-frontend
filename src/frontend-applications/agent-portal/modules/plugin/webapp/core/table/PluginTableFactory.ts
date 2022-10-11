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
import { Table } from '../../../../table/model/Table';
import { PluginTableContentProvider } from './PluginTableContentProvider';
import { PluginProperty } from '../../../model/PluginProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';

export class PluginTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.PLUGIN;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting);
        tableConfiguration.enableSelection = false;
        const table = new Table(tableKey, tableConfiguration, contextId);

        table.setContentProvider(
            new PluginTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(PluginProperty.PRODUCT),
            this.getDefaultColumnConfiguration(PluginProperty.DESCRIPTION),
            this.getDefaultColumnConfiguration(PluginProperty.CLIENT_ID),
            this.getDefaultColumnConfiguration(PluginProperty.FULL_VERSION),
            this.getDefaultColumnConfiguration(PluginProperty.INIT_ORDER),
            this.getDefaultColumnConfiguration(PluginProperty.REQUIRES),
        ];
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.PLUGIN, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        tableConfiguration.objectType = KIXObjectType.PLUGIN;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config: IColumnConfiguration;
        switch (property) {
            case PluginProperty.CLIENT_ID:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 200, true, true
                );
                break;
            case PluginProperty.DESCRIPTION:
            case PluginProperty.REQUIRES:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 500, true, true
                );
                break;
            case PluginProperty.INIT_ORDER:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 50, true, true
                );
                break;
            default:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true
                );
        }
        return config;
    }

}
