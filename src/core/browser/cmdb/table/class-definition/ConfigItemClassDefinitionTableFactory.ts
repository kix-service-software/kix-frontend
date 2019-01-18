import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration, ToggleOptions,
    TableToggleLayer, TableHeaderHeight, TableRowHeight
} from "../../../standard-table";
import {
    KIXObjectType, ConfigItemClassDefinition, DataType, ConfigItemClassDefinitionProperty
} from "../../../../model";
import { IdService } from "../../../IdService";
import { ConfigItemClassDefinitionTableContentLayer } from "./ConfigItemClassDefinitionTableContentLayer";
import { ConfigItemClassDefinitionTableLabelLayer } from "./ConfigItemClassDefinitionTableLabelLayer";

export class ConfigItemClassDefinitionTableFactory implements IStandardTableFactory<ConfigItemClassDefinition> {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<ConfigItemClassDefinition> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('config-item-class-definition-table'),
            tableConfiguration,
            layerConfiguration,
            listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(ConfigItemClassDefinitionProperty.VERSION, true, false, true, true, 100),
            new TableColumnConfiguration(
                ConfigItemClassDefinitionProperty.CREATE_TIME, true, false, true, true, 150,
                true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(ConfigItemClassDefinitionProperty.CREATE_BY, true, false, true, true, 150)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.headerHeight = TableHeaderHeight.SMALL;
            tableConfiguration.rowHeight = TableRowHeight.SMALL;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        tableConfiguration.toggle = true;
        tableConfiguration.toggleOptions = new ToggleOptions(
            'config-item-class-definition', 'definition', [], true
        );

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new ConfigItemClassDefinitionTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new ConfigItemClassDefinitionTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);
        }

        const listener = {
            rowToggled: () => { return; }
        };
        layerConfiguration.toggleLayer = new TableToggleLayer(listener, false);

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
