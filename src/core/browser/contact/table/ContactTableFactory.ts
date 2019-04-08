import { KIXObjectType, ContextMode, ContactProperty, KIXObjectLoadingOptions } from "../../../model";
import { RoutingConfiguration } from "../../router";
import { ContactDetailsContext } from "../context";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, TableRowHeight, IColumnConfiguration
} from "../../table";
import { ContactTableContentProvider } from "./ContactTableContentProvider";
import { TableFactory } from "../../table/TableFactory";

export class ContactTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, short);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, tableConfiguration.filter, tableConfiguration.sortOrder, null,
            tableConfiguration.limit, ['TicketStats']
        );

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new ContactTableContentProvider(table, objectIds, loadingOptions, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);
        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;
        if (short) {
            tableColumns = [
                this.getDefaultColumnConfiguration(ContactProperty.USER_FIRST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.USER_LAST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.USER_EMAIL),
                this.getDefaultColumnConfiguration(ContactProperty.USER_LOGIN),
                this.getDefaultColumnConfiguration(ContactProperty.USER_CUSTOMER_ID),
                this.getDefaultColumnConfiguration(ContactProperty.USER_CITY),
                this.getDefaultColumnConfiguration(ContactProperty.USER_STREET),
                this.getDefaultColumnConfiguration(ContactProperty.VALID_ID)
            ];
        } else {
            tableColumns = [
                this.getDefaultColumnConfiguration(ContactProperty.USER_FIRST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.USER_LAST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.USER_EMAIL),
                this.getDefaultColumnConfiguration(ContactProperty.USER_LOGIN),
                this.getDefaultColumnConfiguration(ContactProperty.USER_CUSTOMER_ID),
                this.getDefaultColumnConfiguration(ContactProperty.USER_PHONE),
                this.getDefaultColumnConfiguration(ContactProperty.USER_COUNTRY),
                this.getDefaultColumnConfiguration(ContactProperty.USER_CITY),
                this.getDefaultColumnConfiguration(ContactProperty.USER_STREET),
                this.getDefaultColumnConfiguration(ContactProperty.VALID_ID)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONTACT, null, 5, tableColumns, null, false, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
            tableConfiguration.enableSelection = true;
            tableConfiguration.toggle = false;
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                ContextMode.DETAILS, ContactProperty.ContactID
            );
        }

        tableConfiguration.objectType = KIXObjectType.CONTACT;
        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ContactProperty.USER_EMAIL:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 175, true, true);
                break;
            case ContactProperty.USER_PHONE:
            case ContactProperty.USER_COUNTRY:
            case ContactProperty.USER_CITY:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 130, true, true);
                break;
            case ContactProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 130, true, true, true);
                break;
            default:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }

}
