import { KIXObjectType } from "../../model";
import { ITable, TableConfiguration } from "../table";

export interface ITableFactory {

    objectType: KIXObjectType;

    createTable(
        tableConfiguration?: TableConfiguration, objectids?: Array<number | string>, contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable;

}
