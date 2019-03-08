import { KIXObjectType, ContextMode, CustomerProperty, KIXObjectLoadingOptions } from "../../../model";
import { CustomerDetailsContext } from "../context";
import { RoutingConfiguration } from "../../router";
import {
    ITableFactory, ITable, TableConfiguration, Table, TableHeaderHeight,
    TableRowHeight, IColumnConfiguration, DefaultColumnConfiguration
} from "../../table";
import { CustomerTableContentProvider } from "./CustomerTableContentProvider";

export class CustomerTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.CUSTOMER;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: string[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting);
        const table = new Table(tableKey, tableConfiguration);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, tableConfiguration.filter, tableConfiguration.sortOrder, null,
            tableConfiguration.limit, [CustomerProperty.TICKET_STATS]
        );

        table.setContentProvider(new CustomerTableContentProvider(table, objectIds, loadingOptions, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(CustomerProperty.CUSTOMER_ID),
            this.getDefaultColumnConfiguration(CustomerProperty.CUSTOMER_COMPANY_NAME),
            this.getDefaultColumnConfiguration(CustomerProperty.CUSTOMER_COMPANY_COUNTRY),
            this.getDefaultColumnConfiguration(CustomerProperty.CUSTOMER_COMPANY_CITY),
            this.getDefaultColumnConfiguration(CustomerProperty.CUSTOMER_COMPANY_STREET),
            this.getDefaultColumnConfiguration(CustomerProperty.VALID_ID)
        ];
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CUSTOMER, null, 5, tableColumns, null, false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
            tableConfiguration.enableSelection = true;
            tableConfiguration.toggle = false;
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, CustomerDetailsContext.CONTEXT_ID, KIXObjectType.CUSTOMER,
                ContextMode.DETAILS, CustomerProperty.CUSTOMER_ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.CUSTOMER;
        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case CustomerProperty.CUSTOMER_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 230, true, true);
                break;
            case CustomerProperty.CUSTOMER_COMPANY_NAME:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 350, true, true);
                break;
            default:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }

}
