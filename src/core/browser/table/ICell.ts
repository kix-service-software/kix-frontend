import { IRow } from "./IRow";
import { TableFilterCriteria } from "../../model";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { ObjectIcon } from "../../model";
import { TableValue } from "./TableValue";

export interface ICell {

    getProperty(): string;

    getValue(): TableValue;

    filter(filterValue?: string, criteria?: TableFilterCriteria[]): Promise<boolean>;

    getRow(): IRow;

    getDisplayValue(): Promise<string>;

    getDisplayIcons(): Promise<Array<string | ObjectIcon>>;

    getColumnConfiguration(): IColumnConfiguration;

}
