import { TableRow } from "..";
import { ITableToggleListener } from "../listener";

export interface ITableToggleLayer {

    toggleRow(row: TableRow): void;

    reset(): void;

    registerToggleListener(listener: ITableToggleListener): void;

}
