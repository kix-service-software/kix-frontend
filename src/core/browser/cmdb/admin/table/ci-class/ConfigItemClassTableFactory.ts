import {
    KIXObjectType, DataType, ConfigItemClass, ConfigItemClassProperty, ContextMode
} from "../../../../../model";
import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration, TableListenerConfiguration,
    StandardTable, TableColumnConfiguration, TableRowHeight, TableHeaderHeight, AbstractTableLayer
} from "../../../../standard-table";
import { IdService } from "../../../../IdService";
import { ConfigItemClassTableContentLayer } from "./ConfigItemClassTableContentLayer";
import { ConfigItemClassTableLabelLayer } from "./ConfigItemClassTableLabelLayer";
import { RoutingConfiguration } from "../../../../router";
import { ConfigItemClassDetailsContext } from "../../context";

export class ConfigItemClassTableFactory implements IStandardTableFactory<ConfigItemClass> {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<ConfigItemClass> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('config-item-class-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(ConfigItemClassProperty.NAME, true, false, true, true, 200, true),
            new TableColumnConfiguration('ICON', false, true, false, true, 41, false),
            new TableColumnConfiguration(
                ConfigItemClassProperty.COMMENT, true, false, true, true, 350, true, false, DataType.STRING
            ),
            new TableColumnConfiguration(ConfigItemClassProperty.VALID_ID, true, false, true, true, 150, true),
            new TableColumnConfiguration(
                ConfigItemClassProperty.CHANGE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(ConfigItemClassProperty.CHANGE_BY, true, false, true, true, 150, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.rowHeight = TableRowHeight.LARGE;
            tableConfiguration.headerHeight = TableHeaderHeight.LARGE;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.rowHeight = TableRowHeight.LARGE;
            tableConfiguration.headerHeight = TableHeaderHeight.LARGE;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, ConfigItemClassDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.DETAILS, ConfigItemClassProperty.ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new ConfigItemClassTableContentLayer([]);
            const labelLayer = new ConfigItemClassTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);
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
