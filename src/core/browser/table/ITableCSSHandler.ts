import { KIXObject } from "../../model";
import { TableValue } from "./TableValue";

export interface ITableCSSHandler<T extends KIXObject> {

    getRowCSSClasses(object: T): string[];

    getValueCSSClasses(object: T, value: TableValue): string[];

}
