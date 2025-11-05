/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../model/configuration/TableRowHeight';
import { IColumnConfiguration } from '../../../../model/configuration/IColumnConfiguration';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DefaultColumnConfiguration } from '../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../model/DataType';
import { MacroProperty } from '../../model/MacroProperty';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { EditMacroDialogContext } from './EditMacroDialogContext';
import { Table } from '../../../table/model/Table';
import { TableFactory } from '../../../table/webapp/core/factory/TableFactory';
import { MacroTableContentProvider } from './MacroTableContentProvider';

export class MacroTableFactory extends TableFactory {

    public objectType: KIXObjectType | string = KIXObjectType.MACRO;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextInstanceId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration, contextInstanceId);
        table.setContentProvider(new MacroTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextInstanceId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(MacroProperty.ID),
            this.getDefaultColumnConfiguration(MacroProperty.NAME),
            this.getDefaultColumnConfiguration(MacroProperty.TYPE),
            this.getDefaultColumnConfiguration(KIXObjectProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.MACRO, null, 20, tableColumns, [], true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                EditMacroDialogContext.CONTEXT_ID, null, null, MacroProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case MacroProperty.NAME:
                config = super.getDefaultColumnConfiguration(property, false);
                break;
            case MacroProperty.ID:
                config = super.getDefaultColumnConfiguration('ICON');
                break;
            case MacroProperty.TYPE:
                config = new DefaultColumnConfiguration(
                    null, null, null, property, true, false, true, false, 150, true, true, true,
                    DataType.STRING, true
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
