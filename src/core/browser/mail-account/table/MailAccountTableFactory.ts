import { RoutingConfiguration } from "../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../table";
import { KIXObjectType, DataType, ContextMode, KIXObjectLoadingOptions, KIXObjectProperty } from "../../../model";
import { MailAccountTableContentProvider } from "./MailAccountTableContentProvider";
import { MailAccountProperty } from "../../../model";
import { TableFactory } from "../../table/TableFactory";
import { MailAccountDetailsContext } from "../context";

export class MailAccountTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.MAIL_ACCOUNT;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        let loadingOptions = null;
        if (tableConfiguration.filter && tableConfiguration.filter.length) {
            loadingOptions = new KIXObjectLoadingOptions(null, tableConfiguration.filter);
        }

        table.setContentProvider(new MailAccountTableContentProvider(
            table, objectIds, loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(MailAccountProperty.HOST),
            this.getDefaultColumnConfiguration(MailAccountProperty.LOGIN),
            this.getDefaultColumnConfiguration(MailAccountProperty.TYPE),
            this.getDefaultColumnConfiguration(MailAccountProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.MAIL_ACCOUNT, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                MailAccountDetailsContext.CONTEXT_ID, KIXObjectType.MAIL_ACCOUNT,
                ContextMode.DETAILS, MailAccountProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case MailAccountProperty.HOST:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case KIXObjectProperty.VALID_ID:
            case MailAccountProperty.TYPE:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true, true);
                break;
            case MailAccountProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 350, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case KIXObjectProperty.CHANGE_TIME:
            case KIXObjectProperty.CREATE_TIME:
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
