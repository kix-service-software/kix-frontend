import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration, ToggleOptions,
    TableToggleLayer, TableHeaderHeight, TableRowHeight
} from "../../../standard-table";
import { KIXObjectType, ConfigItem, VersionProperty, DataType } from "../../../../model";
import { IdService } from "../../../IdService";
import { ConfigItemVersionTableContentLayer } from "./ConfigItemVersionTableContentLayer";
import { ConfigItemVersionTableLabelLayer } from "./ConfigItemVersionTableLabelLayer";

export class ConfigItemVersionTableFactory implements IStandardTableFactory<ConfigItem> {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<ConfigItem> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
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
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(VersionProperty.COUNT_NUMBER, true, false, true, true, 100),
            new TableColumnConfiguration(VersionProperty.CREATE_BY, true, false, true, true, 150),
            new TableColumnConfiguration(
                VersionProperty.CREATE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(VersionProperty.CURRENT, true, false, true, false, 150, false)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.headerHeight = TableHeaderHeight.LARGE;
            tableConfiguration.rowHeight = TableRowHeight.LARGE;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('config-item-version-details', 'version', [
                'config-item-version-maximize-action', 'config-item-print-action'
            ], true);
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new ConfigItemVersionTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new ConfigItemVersionTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);
        }

        if (defaultToggle) {
            const listener = {
                rowToggled: () => { return; }
            };
            layerConfiguration.toggleLayer = new TableToggleLayer(listener, true);
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
