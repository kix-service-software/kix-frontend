import { TableRow } from '../TableRow';

export interface ITableToggleListener {

    rowToggled(row: TableRow, rowIndex: number, tableId: string): void;

}
