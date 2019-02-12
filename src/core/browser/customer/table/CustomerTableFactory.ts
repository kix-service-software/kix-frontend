import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration,
    TableListenerConfiguration, StandardTable, TableSortLayer, TableFilterLayer,
    AbstractTableLayer, TableColumnConfiguration, TableHeaderHeight, TableRowHeight
} from "../../standard-table";
import { KIXObjectType, ContextMode, Customer, CustomerProperty, KIXObject } from "../../../model";
import { IdService } from "../../IdService";
import { ContextService } from "../../context";
import { CustomerTableLabelLayer } from "./CustomerTableLabelLayer";
import { CustomerTableContentLayer } from "./CustomerTableContentLayer";
import { CustomerDetailsContext } from "../context";
import { RoutingConfiguration } from "../../router";

export class CustomerTableFactory implements IStandardTableFactory {

    public objectType: KIXObjectType = KIXObjectType.CUSTOMER;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<Customer> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('customer-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(CustomerProperty.CUSTOMER_ID, true, false, true, true, 230),
            new TableColumnConfiguration(
                CustomerProperty.CUSTOMER_COMPANY_NAME, true, false, true, true, 350
            ),
            new TableColumnConfiguration(
                CustomerProperty.CUSTOMER_COMPANY_COUNTRY, true, false, true, true, 150
            ),
            new TableColumnConfiguration(
                CustomerProperty.CUSTOMER_COMPANY_City, true, false, true, true, 150
            ),
            new TableColumnConfiguration(
                CustomerProperty.CUSTOMER_COMPANY_STREET, true, false, true, true, 150
            ),
            new TableColumnConfiguration(CustomerProperty.VALID_ID, true, false, true, true, 130),
        ];
        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                null, 5, tableColumns, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, CustomerDetailsContext.CONTEXT_ID, KIXObjectType.CUSTOMER,
                ContextMode.DETAILS, CustomerProperty.CUSTOMER_ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new CustomerTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new CustomerTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer,
                [new TableFilterLayer()], [new TableSortLayer()]
            );
        }

        return layerConfiguration;
    }

    private setDefaultListenerConfiguration(
        listenerConfiguration: TableListenerConfiguration
    ): TableListenerConfiguration {

        if (!listenerConfiguration) {
            listenerConfiguration = new TableListenerConfiguration();
        }

        return listenerConfiguration;
    }

}
