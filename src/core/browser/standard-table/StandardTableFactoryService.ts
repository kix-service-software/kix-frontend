import { IStandardTableFactory } from "./IStandardTableFactory";
import { KIXObjectType, KIXObject } from "../../model";
import { StandardTable } from "./StandardTable";
import { TableConfiguration, TableLayerConfiguration, TableListenerConfiguration } from "./configuration";

export class StandardTableFactoryService {

    private static INSTANCE: StandardTableFactoryService;

    public static getInstance(): StandardTableFactoryService {
        if (!StandardTableFactoryService.INSTANCE) {
            StandardTableFactoryService.INSTANCE = new StandardTableFactoryService();
        }

        return StandardTableFactoryService.INSTANCE;
    }

    private constructor() { }

    private factories: IStandardTableFactory[] = [];

    public registerFactory(factory: IStandardTableFactory): void {
        if (this.factories.some((f) => f.objectType === factory.objectType)) {
            console.warn(`Redudant StandardTableFactory for type ${factory.objectType}`);
        }

        this.factories.push(factory);
    }

    public createStandardTable<T extends KIXObject = KIXObject>(
        objectType: KIXObjectType,
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean,
        short: boolean = false
    ): StandardTable<T> {
        const factory = this.factories.find((f) => f.objectType === objectType);
        const standardTable = factory
            ? factory.createTable(tableConfiguration, layerConfiguration,
                listenerConfiguration, defaultRouting, defaultToggle, short)
            : null;
        return (standardTable as StandardTable<T>);
    }
}
