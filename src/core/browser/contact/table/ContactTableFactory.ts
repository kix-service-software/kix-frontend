import { KIXObjectType, ContextMode, ContactProperty, KIXObjectLoadingOptions } from "../../../model";
import { RoutingConfiguration } from "../../router";
import { ContactDetailsContext } from "../context";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration, TableHeaderHeight, TableRowHeight
} from "../../table";
import { ContactTableContentProvider } from "./ContactTableContentProvider";

export class ContactTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public createTable(
        tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, short);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, tableConfiguration.filter, tableConfiguration.sortOrder, null,
            tableConfiguration.limit, ['TicketStats']
        );

        const table = new Table(tableConfiguration);
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
                new DefaultColumnConfiguration(
                    ContactProperty.USER_FIRST_NAME, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    ContactProperty.USER_LAST_NAME, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, false, 175, true, true),
                new DefaultColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, false, 150, true, true),
                new DefaultColumnConfiguration(
                    ContactProperty.USER_CUSTOMER_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(ContactProperty.USER_CITY, true, false, true, false, 130, true, true),
                new DefaultColumnConfiguration(ContactProperty.USER_STREET, true, false, true, false, 150, true, true),
                new DefaultColumnConfiguration(ContactProperty.VALID_ID, true, false, true, false, 130, true, true)
            ];
        } else {
            tableColumns = [
                new DefaultColumnConfiguration(
                    ContactProperty.USER_FIRST_NAME, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(
                    ContactProperty.USER_LAST_NAME, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, false, 175, true, true),
                new DefaultColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, false, 150, true, true),
                new DefaultColumnConfiguration(
                    ContactProperty.USER_CUSTOMER_ID, true, false, true, false, 150, true, true
                ),
                new DefaultColumnConfiguration(ContactProperty.USER_PHONE, true, false, true, false, 130, true, true),
                new DefaultColumnConfiguration(ContactProperty.USER_COUNTRY, true, false, true, false, 130, true, true),
                new DefaultColumnConfiguration(ContactProperty.USER_CITY, true, false, true, false, 130, true, true),
                new DefaultColumnConfiguration(ContactProperty.USER_STREET, true, false, true, false, 150, true, true),
                new DefaultColumnConfiguration(ContactProperty.VALID_ID, true, false, true, false, 130, true, true)
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

}
