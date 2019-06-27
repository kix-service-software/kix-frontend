import {
    KIXObjectType, ContextMode, ContactProperty, KIXObjectLoadingOptions, KIXObjectProperty, DataType
} from "../../../model";
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

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(
            new ContactTableContentProvider(table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);
        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;
        if (short) {
            tableColumns = [
                this.getDefaultColumnConfiguration(ContactProperty.FIRST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.LAST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.EMAIL),
                this.getDefaultColumnConfiguration(ContactProperty.LOGIN),
                this.getDefaultColumnConfiguration(ContactProperty.PRIMARY_ORGANISATION_ID),
                this.getDefaultColumnConfiguration(ContactProperty.CITY),
                this.getDefaultColumnConfiguration(ContactProperty.STREET),
                this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID)
            ];
        } else {
            tableColumns = [
                this.getDefaultColumnConfiguration(ContactProperty.FIRST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.LAST_NAME),
                this.getDefaultColumnConfiguration(ContactProperty.EMAIL),
                this.getDefaultColumnConfiguration(ContactProperty.LOGIN),
                this.getDefaultColumnConfiguration(ContactProperty.PRIMARY_ORGANISATION_ID),
                this.getDefaultColumnConfiguration(ContactProperty.PHONE),
                this.getDefaultColumnConfiguration(ContactProperty.COUNTRY),
                this.getDefaultColumnConfiguration(ContactProperty.CITY),
                this.getDefaultColumnConfiguration(ContactProperty.STREET),
                this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONTACT, null, null, tableColumns, false, false, null, null,
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
                ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                ContextMode.DETAILS, ContactProperty.ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.CONTACT;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ContactProperty.EMAIL:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 175, true, true);
                break;
            case ContactProperty.PHONE:
            case ContactProperty.COUNTRY:
            case ContactProperty.CITY:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 130, true, true);
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 130, true, true, true);
                break;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.STRING, true, null,
                    'Translatable#Organisation'
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }

}
