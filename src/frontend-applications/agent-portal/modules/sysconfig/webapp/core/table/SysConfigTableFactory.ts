/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SysConfigTableContentProvider } from './SysConfigTableContentProvider';
import { TableFactory } from '../../../../base-components/webapp/core/table/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { Table } from '../../../../base-components/webapp/core/table';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { SysConfigOptionDefinitionProperty } from '../../../model/SysConfigOptionDefinitionProperty';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { DialogRoutingConfiguration } from '../../../../../model/configuration/DialogRoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';

export class SysConfigTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): Table {

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
                SysConfigOptionDefinitionProperty.NAME, true, true, true, false, 400, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(null, null, null,
                SysConfigOptionDefinitionProperty.IS_MODIFIED, false, true, true, false, 100, true, true, true
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
                SysConfigOptionDefinitionProperty.ACCESS_LEVEL, true, false, true, false, 100, true, true, true,
                DataType.STRING, true, null, null, true
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
