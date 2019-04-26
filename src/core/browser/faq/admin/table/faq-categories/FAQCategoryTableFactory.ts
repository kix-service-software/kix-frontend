import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, DataType } from "../../../../../model";
import { TableFactory } from "../../../../table/TableFactory";
import { FAQCategoryTableContentProvider } from "./FAQCategoryTableContentProvider";
import { FAQCategoryProperty } from "../../../../../model/kix/faq";

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
            this.getDefaultColumnConfiguration('ICON'),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.COMMENT),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.VALID_ID),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(FAQCategoryProperty.CHANGE_BY)
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
            // tableConfiguration.routingConfiguration = new RoutingConfiguration(
            //     null, UserDetailsContext.CONTEXT_ID, KIXObjectType.USER,
            //     ContextMode.DETAILS, UserProperty.USER_ID
            // );
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
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    property, false, true, false, false, null, false, false, false, undefined, false
                );
                break;
            case FAQCategoryProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 130, true, true, true);
                break;
            case FAQCategoryProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 275, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case FAQCategoryProperty.CHANGE_TIME:
            case FAQCategoryProperty.CREATE_TIME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            default:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }
}
