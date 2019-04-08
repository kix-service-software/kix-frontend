import { TableValue } from "./TableValue";

export interface ITableCSSHandler<T> {

    getRowCSSClasses(object: T): string[];

    getValueCSSClasses(object: T, value: TableValue): string[];

}
