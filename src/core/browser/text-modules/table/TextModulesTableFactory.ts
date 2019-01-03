import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration,
    TableListenerConfiguration, StandardTable, TableColumnConfiguration, TableRowHeight,
    TableHeaderHeight, AbstractTableLayer
} from "../../standard-table";
import { TextModule, KIXObjectType, TextModuleProperty } from "../../../model";
import { IdService } from "../../IdService";
import { TextModulesTableContentLayer } from "./TextModulesTableContentLayer";
import { TextModulesTableLabelLayer } from "./TextModulesTableLabelLayer";

export class TextModulesTableFactory implements IStandardTableFactory<TextModule> {

    public objectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<TextModule> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('ticket-types-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TextModuleProperty.NAME, true, false, true, true, 200, true),
            new TableColumnConfiguration(TextModuleProperty.LANGUAGE, true, false, true, true, 200, true),
            new TableColumnConfiguration(TextModuleProperty.CATEGORY, true, false, true, true, 200, true),
            new TableColumnConfiguration(TextModuleProperty.KEYWORDS, true, false, true, true, 250, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.rowHeight = TableRowHeight.SMALL;
            tableConfiguration.headerHeight = TableHeaderHeight.SMALL;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            //
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new TextModulesTableContentLayer(
                [], tableConfiguration.filter
            );
            const labelLayer = new TextModulesTableLabelLayer();

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
