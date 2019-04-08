import { ITableFactory } from "./ITableFactory";
import { KIXObjectType } from "../../model";
import { ITable } from "../table";
import { TableConfiguration } from "./TableConfiguration";
import { IColumnConfiguration } from "./IColumnConfiguration";

export class TableFactoryService {

    private static INSTANCE: TableFactoryService;

    public static getInstance(): TableFactoryService {
        if (!TableFactoryService.INSTANCE) {
            TableFactoryService.INSTANCE = new TableFactoryService();
        }

        return TableFactoryService.INSTANCE;
    }

    private constructor() { }

    private factories: ITableFactory[] = [];

    public registerFactory(factory: ITableFactory): void {
        if (this.factories.some((f) => f.isFactoryFor(factory.objectType))) {
            console.warn(`Redudant TableFactory for type ${factory.objectType}`);
        }

        this.factories.push(factory);
    }

    public createTable(
        tableKey: string, objectType: KIXObjectType, tableConfiguration?: TableConfiguration,
        objectIds?: Array<number | string>, contextId?: string, defaultRouting?: boolean,
        defaultToggle?: boolean, short: boolean = false
    ): ITable {
        const factory = this.factories.find((f) => f.isFactoryFor(objectType));
        const table = factory
            ? factory.createTable(
                tableKey, tableConfiguration, objectIds, contextId,
                defaultRouting, defaultToggle, short, objectType
            )
            : null;
        return table;
    }

    public getDefaultColumnConfiguration(objectType: KIXObjectType, property: string): IColumnConfiguration {
        const factory = this.factories.find((f) => f.objectType === objectType);
        return factory ? factory.getDefaultColumnConfiguration(property) : null;
    }
}
