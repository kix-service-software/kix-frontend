/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RoutingConfiguration, DialogRoutingConfiguration } from "../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../table";
import {
    KIXObjectType, DataType, KIXObjectProperty, SysConfigOptionDefinitionProperty, ContextMode
} from "../../../model";
import { TableFactory } from "../../table/TableFactory";
import { SysConfigTableContentProvider } from "./SysConfigTableContentProvider";

export class SysConfigTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new SysConfigTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                SysConfigOptionDefinitionProperty.NAME, true, false, true, false, 400, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                SysConfigOptionDefinitionProperty.IS_MODIFIED, true, false, false, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                SysConfigOptionDefinitionProperty.CONTEXT, true, false, true, false, 150, true, true, true,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                SysConfigOptionDefinitionProperty.CONTEXT_METADATA, true, false, true, false, 150, true, true, true,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                KIXObjectProperty.VALID_ID, true, false, true, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                SysConfigOptionDefinitionProperty.VALUE, true, false, true, false, 300, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                KIXObjectProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                null, null, null, KIXObjectProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, null, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {

            tableConfiguration.routingConfiguration = new DialogRoutingConfiguration(
                null, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, ContextMode.EDIT_ADMIN,
                SysConfigOptionDefinitionProperty.NAME, null, true,
                undefined, true, 'sysconfig-edit-form'
            );
        }

        return tableConfiguration;
    }
}
