/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, ContextMode, DataType, KIXObjectProperty } from "../../../model";
import { RoutingConfiguration } from "../../router";
import {
    TableConfiguration, ITable, Table,
    DefaultColumnConfiguration, IColumnConfiguration, TableHeaderHeight, TableRowHeight
} from "../../table";
import { TableFactory } from "../../table/TableFactory";
import { GeneralCatalogTableContentProvider } from ".";
import { GeneralCatalogItemProperty } from "../../../model/kix/general-catalog/GeneralCatalogItemProperty";

export class GeneralCatalogTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.GENERAL_CATALOG_ITEM;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new GeneralCatalogTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(GeneralCatalogItemProperty.CLASS),
            this.getDefaultColumnConfiguration(GeneralCatalogItemProperty.NAME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.GENERAL_CATALOG_ITEM, null, null, tableColumns, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        // tslint:disable-next-line:no-empty
        if (defaultRouting) {
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case GeneralCatalogItemProperty.NAME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case GeneralCatalogItemProperty.CLASS:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 300, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }


}
