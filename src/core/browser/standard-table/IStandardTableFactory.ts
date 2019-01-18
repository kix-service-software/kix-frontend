import { StandardTable } from "./StandardTable";
import { KIXObjectType, KIXObject } from "../../model";
import { TableConfiguration, TableListenerConfiguration, TableLayerConfiguration } from "./configuration";

export interface IStandardTableFactory<T extends KIXObject = KIXObject> {

    objectType: KIXObjectType;

    createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean,
        short?: boolean
    ): StandardTable<T>;

}
