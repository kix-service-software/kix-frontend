import { ITableFactory } from "./ITableFactory";
import { KIXObjectType } from "../../model";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { TableConfiguration } from "./TableConfiguration";
import { ITable } from "./ITable";

export abstract class TableFactory implements ITableFactory {

    public abstract objectType: KIXObjectType;

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === this.objectType;
    }

    public abstract createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<string | number>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType
    ): ITable;

    public abstract getDefaultColumnConfiguration(property: string): IColumnConfiguration;

}
