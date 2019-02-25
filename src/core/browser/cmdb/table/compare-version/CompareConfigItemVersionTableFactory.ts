import { KIXObjectType, DataType } from "../../../../model";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, TableRowHeight
} from "../../../table";
import { CompareConfigItemVersionTableContentProvider } from "./CompareConfigItemVersionTableContentProvider";

export class CompareConfigItemVersionTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION_COMPARE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new CompareConfigItemVersionTableContentProvider(table, null, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const columns = tableConfiguration
            ? tableConfiguration.tableColumns
            : [new DefaultColumnConfiguration(
                'CONFIG_ITEM_ATTRIBUTE', true, false, true, false, 250, false, false, false, DataType.STRING, true
            )];

        tableConfiguration = new TableConfiguration(
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, null, null, columns, null, false, false, null, null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE, null, null, true
        );
        tableConfiguration.displayLimit = 18;

        return tableConfiguration;
    }

}
