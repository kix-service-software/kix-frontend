import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../table";
import { KIXObjectType, DataType, KIXObjectLoadingOptions, KIXObjectProperty } from "../../../model";
import { MailFilterTableContentProvider } from "./MailFilterTableContentProvider";
import { MailFilterProperty } from "../../../model";
import { TableFactory } from "../../table/TableFactory";

export class MailFilterTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.MAIL_FILTER;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new MailFilterTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(MailFilterProperty.NAME),
            this.getDefaultColumnConfiguration(MailFilterProperty.STOP_AFTER_MATCH),
            this.getDefaultColumnConfiguration(MailFilterProperty.MATCH),
            this.getDefaultColumnConfiguration(MailFilterProperty.SET),
            this.getDefaultColumnConfiguration(KIXObjectProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.MAIL_FILTER, null, null, tableColumns, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            //
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case MailFilterProperty.NAME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case MailFilterProperty.STOP_AFTER_MATCH:
                config = new DefaultColumnConfiguration(
                    property, false, true, true, false, 41, true, false,
                    false, DataType.NUMBER, false, null, null, false
                );
                break;
            case MailFilterProperty.MATCH:
            case MailFilterProperty.SET:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 300, false, false,
                    false, DataType.STRING, true, 'label-list-cell-content', null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
