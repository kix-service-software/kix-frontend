import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration, ToggleOptions, TableToggleLayer
} from "../../standard-table";
import { KIXObjectType, ContextMode, ConfigItem, ConfigItemProperty, DataType } from "../../../model";
import { IdService } from "../../IdService";
import { RoutingConfiguration } from "../../router";
import { ConfigItemDetailsContext } from "../context";
import { ConfigItemTableContentLayer } from "./ConfigItemTableContentLayer";
import { ConfigItemTableLabelLayer } from "./ConfigItemTableLabelLayer";

export class ConfigItemTableFactory implements IStandardTableFactory<ConfigItem> {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean,
        short?: boolean
    ): StandardTable<ConfigItem> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('config-item-table'),
            tableConfiguration,
            layerConfiguration,
            listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;

        if (short) {
            tableColumns = [
                new TableColumnConfiguration(ConfigItemProperty.NUMBER, true, false, true, true, 135),
                new TableColumnConfiguration(ConfigItemProperty.NAME, true, false, true, true, 300),
                new TableColumnConfiguration(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, false, true, true, true, 55,
                    false, null, null, null, 'kix-icon-productive_active'
                ),
                new TableColumnConfiguration(
                    ConfigItemProperty.CUR_INCI_STATE_ID, false, true, true, true, 55,
                    false, null, null, null, 'kix-icon-service_active'
                ),
                new TableColumnConfiguration(ConfigItemProperty.CLASS_ID, true, false, true, true, 200),
                new TableColumnConfiguration(
                    ConfigItemProperty.CHANGE_TIME, true, false, true, true, 125, true, false, DataType.DATE_TIME
                )
            ];
        } else {
            tableColumns = [
                new TableColumnConfiguration(ConfigItemProperty.NUMBER, true, false, true, true, 135),
                new TableColumnConfiguration(ConfigItemProperty.NAME, true, false, true, true, 300),
                new TableColumnConfiguration(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, false, true, true, true, 55,
                    false, null, null, null, 'kix-icon-productive_active'
                ),
                new TableColumnConfiguration(
                    ConfigItemProperty.CUR_INCI_STATE_ID, false, true, true, true, 55,
                    false, null, null, null, 'kix-icon-service_active'
                ),
                new TableColumnConfiguration(ConfigItemProperty.CLASS_ID, true, false, true, true, 200),
                new TableColumnConfiguration(
                    ConfigItemProperty.CHANGE_TIME, true, false, true, true, 125, true, false, DataType.DATE_TIME
                ),
                new TableColumnConfiguration(ConfigItemProperty.CHANGE_BY, true, false, true, true, 150)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('config-item-version-details', 'configItem', [
                'config-item-version-maximize-action', 'config-item-print-action'
            ], true);
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new ConfigItemTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new ConfigItemTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);
        }

        if (defaultToggle) {
            const listener = {
                rowToggled: () => { return; }
            };
            layerConfiguration.toggleLayer = new TableToggleLayer(listener, false);
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
