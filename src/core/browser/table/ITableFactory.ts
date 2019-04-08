import { KIXObjectType } from "../../model";
import { ITable, TableConfiguration } from "../table";
import { IColumnConfiguration } from "./IColumnConfiguration";

export interface ITableFactory {

    objectType: KIXObjectType;

    isFactoryFor(objectType: KIXObjectType): boolean;

    createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType
    ): ITable;

    getDefaultColumnConfiguration(property: string): IColumnConfiguration;
}
