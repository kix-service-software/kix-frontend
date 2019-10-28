/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from "../table/TableFactory";
import { KIXObjectType, KIXObjectProperty, DataType, ContextMode } from "../../model";
import {
    TableConfiguration, ITable, Table, TableHeaderHeight, TableRowHeight,
    IColumnConfiguration, DefaultColumnConfiguration, ToggleOptions
} from "../table";
import { WebformTableContentProvider } from "./WebformTableContentProvider";
import { WebformProperty } from "../../model/webform";
import { RoutingConfiguration } from "../router";
import { WebformDetailsContext } from "./context/WebformDetailsContext";

export class WebformTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.WEBFORM;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new WebformTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(WebformProperty.TITLE),
            this.getDefaultColumnConfiguration(WebformProperty.QUEUE_ID),
            this.getDefaultColumnConfiguration(WebformProperty.PRIORITY_ID),
            this.getDefaultColumnConfiguration(WebformProperty.TYPE_ID),
            this.getDefaultColumnConfiguration(WebformProperty.STATE_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.WEBFORM, null, null, tableColumns, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                WebformDetailsContext.CONTEXT_ID, KIXObjectType.WEBFORM,
                ContextMode.DETAILS, WebformProperty.ID
            );
        }

        tableConfiguration.toggle = true;
        tableConfiguration.toggleOptions = new ToggleOptions('webform-code-content', 'webform', [], false);

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        switch (property) {
            case WebformProperty.PRIORITY_ID:
                return new DefaultColumnConfiguration(
                    property, false, true, true, false, 80, true, true, true, DataType.STRING, false
                );
            case WebformProperty.STATE_ID:
                return new DefaultColumnConfiguration(
                    property, true, true, true, false, 120, true, true, true, DataType.STRING, true
                );
            case WebformProperty.TYPE_ID:
            case WebformProperty.QUEUE_ID:
            case KIXObjectProperty.VALID_ID:
                return new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, true, DataType.STRING, true
                );
            default:
                return super.getDefaultColumnConfiguration(property);
        }
    }
}
