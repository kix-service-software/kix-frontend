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
            new DefaultColumnConfiguration(
                FAQCategoryProperty.NAME, true, false, true, false, 250, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(FAQCategoryProperty.ID, false, true, false, true, 41, false),
            new DefaultColumnConfiguration(
                FAQCategoryProperty.PARENT_ID, true, false, true, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(
                FAQCategoryProperty.COMMENT, true, false, true, false, 100, true, true
            ),
            new DefaultColumnConfiguration(
                FAQCategoryProperty.VALID_ID, true, false, true, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(
                FAQCategoryProperty.CREATE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(FAQCategoryProperty.CREATE_BY, true, false, true, true, 150, true, true),
            new DefaultColumnConfiguration(
                FAQCategoryProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(FAQCategoryProperty.CHANGE_BY, true, false, true, false, 150, true, true)
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

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
