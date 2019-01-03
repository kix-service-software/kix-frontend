import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration,
    TableListenerConfiguration, StandardTable, TableSortLayer, TableFilterLayer,
    AbstractTableLayer, TableColumnConfiguration, TableHeaderHeight, TableRowHeight
} from "../../standard-table";
import { KIXObjectType, Contact, ContextMode, ContactProperty, KIXObject } from "../../../model";
import { IdService } from "../../IdService";
import { ContextService } from "../../context";
import { ContactTableLabelLayer } from "./ContactTableLabelLayer";
import { ContactTableContentLayer } from "./ContactTableContentLayer";
import { RoutingConfiguration } from "../../router";
import { ContactDetailsContext } from "../context";

export class ContactTableFactory implements IStandardTableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean,
        short?: boolean
    ): StandardTable<Contact> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, short);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('contact-table'),
            tableConfiguration,
            layerConfiguration,
            listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;
        if (short) {
            tableColumns = [
                new TableColumnConfiguration(ContactProperty.USER_FIRST_NAME, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_LAST_NAME, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, true, 175),
                new TableColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_CUSTOMER_ID, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_CITY, true, false, true, true, 130),
                new TableColumnConfiguration(ContactProperty.USER_STREET, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.VALID_ID, true, false, true, true, 130)
            ];
        } else {
            tableColumns = [
                new TableColumnConfiguration(ContactProperty.USER_FIRST_NAME, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_LAST_NAME, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_EMAIL, true, false, true, true, 175),
                new TableColumnConfiguration(ContactProperty.USER_LOGIN, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_CUSTOMER_ID, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.USER_PHONE, true, false, true, true, 130),
                new TableColumnConfiguration(ContactProperty.USER_COUNTRY, true, false, true, true, 130),
                new TableColumnConfiguration(ContactProperty.USER_CITY, true, false, true, true, 130),
                new TableColumnConfiguration(ContactProperty.USER_STREET, true, false, true, true, 150),
                new TableColumnConfiguration(ContactProperty.VALID_ID, true, false, true, true, 130)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                null, 5, tableColumns, null, false, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, ContactDetailsContext.CONTEXT_ID, KIXObjectType.CONTACT,
                ContextMode.DETAILS, ContactProperty.ContactID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new ContactTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new ContactTableLabelLayer();

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
