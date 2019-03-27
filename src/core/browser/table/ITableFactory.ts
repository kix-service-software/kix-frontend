import { KIXObjectType } from "../../model";
import { ITable, TableConfiguration } from "../table";
import { IColumnConfiguration } from "./IColumnConfiguration";

export interface ITableFactory {

    objectType: KIXObjectType;

    createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable;

    getDefaultColumnConfiguration(property: string): IColumnConfiguration;
}
