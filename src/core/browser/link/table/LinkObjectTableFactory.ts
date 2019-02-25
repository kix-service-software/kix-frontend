import { KIXObjectType, LinkObject, LinkObjectProperty, SortOrder, KIXObjectLoadingOptions } from "../../../model";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration, TableRowHeight, TableHeaderHeight
} from "../../table";
import { LinkObjectTableContentProvider } from "./LinkObjectTableContentProvider";

export class LinkObjectTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new LinkObjectTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(LinkObjectProperty.LINKED_OBJECT_TYPE, true, true, true, true, 200),
            new DefaultColumnConfiguration(LinkObjectProperty.LINKED_OBJECT_DISPLAY_ID, true, false, true, true, 200),
            new DefaultColumnConfiguration(LinkObjectProperty.TITLE, true, false, true, true, 500),
            new DefaultColumnConfiguration(LinkObjectProperty.LINKED_AS, true, false, true, true, 140),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(KIXObjectType.LINK_OBJECT,
                null, 10, tableColumns, null, true, false, null,
                null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

}
