import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, DataType, ContextMode, KIXObjectProperty } from "../../../../../model";
import { TableFactory } from "../../../../table/TableFactory";
import { FAQCategoryTableContentProvider } from "./FAQCategoryTableContentProvider";
import { FAQCategoryProperty } from "../../../../../model/kix/faq";
import { FAQCategoryDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";

export class FAQCategoryTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.FAQ_CATEGORY;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new FAQCategoryTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(FAQCategoryProperty.NAME),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.ICON),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.FAQ_CATEGORY, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                FAQCategoryDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_CATEGORY,
                ContextMode.DETAILS, FAQCategoryProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case FAQCategoryProperty.NAME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case FAQCategoryProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 275, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
