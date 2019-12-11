/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from "../../../../../base-components/webapp/core/table/TableFactory";
import { KIXObjectType } from "../../../../../../model/kix/KIXObjectType";
import { TableConfiguration } from "../../../../../../model/configuration/TableConfiguration";
import { ITable, Table, ToggleOptions } from "../../../../../base-components/webapp/core/table";
import { ConfigItemClassDefinitionTableContentProvider } from ".";
import { DefaultColumnConfiguration } from "../../../../../../server/services/configuration/DefaultColumnConfiguration";
import { ConfigItemClassDefinitionProperty } from "../../../../model/ConfigItemClassDefinitionProperty";
import { DataType } from "../../../../../../model/DataType";
import { TableHeaderHeight } from "../../../../../../model/configuration/TableHeaderHeight";

export class ConfigItemClassDefinitionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new ConfigItemClassDefinitionTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemClassDefinitionProperty.VERSION, true, false, true, true, 100, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemClassDefinitionProperty.CREATE_BY, true, false, true, true, 150, true, true
            ),
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemClassDefinitionProperty.CREATE_TIME, true, false, true, true, 150,
                true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(null, null, null,
                ConfigItemClassDefinitionProperty.CURRENT, true, false, true, true, 150,
                true, true, false, DataType.DATE_TIME
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, null, null, tableColumns, [], false, true,
                new ToggleOptions(
                    'config-item-class-definition', 'definition', [], true
                ), null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            //
        }

        return tableConfiguration;
    }
}