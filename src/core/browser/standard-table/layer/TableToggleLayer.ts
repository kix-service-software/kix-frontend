import { AbstractTableLayer } from './AbstractTableLayer';
import { ITableToggleLayer } from './ITableToggleLayer';
import { TableRow, ITableToggleListener } from '..';

export class TableToggleLayer extends AbstractTableLayer implements ITableToggleLayer {

    protected toggledRows: TableRow[] = [];

    private cachedRows: TableRow[] = [];

    protected toggleListener: ITableToggleListener[] = [];

    public constructor(listener: ITableToggleListener, protected toggleFirst: boolean) {
        super();
        if (listener) {
            this.toggleListener.push(listener);
        }
    }

    public registerToggleListener(listener: ITableToggleListener): void {
        if (listener) {
            this.toggleListener.push(listener);
        }
    }

    public toggleRow(row: TableRow): void {
        const rowIndex = this.toggledRows.findIndex((r) => r.object.equals(row.object));

        this.toggleFirst = false;

        if (rowIndex === -1) {
            this.toggledRows.push(row);
        } else {
            this.toggledRows.splice(rowIndex, 1);
        }

        const index = this.cachedRows.findIndex((r) => r.object.equals(row.object));

        if (this.toggleListener) {
            this.toggleListener.forEach((l) => l.rowToggled(row, index, this.tableId));
        }

    }

    public async getRows(refresh: boolean = false): Promise<TableRow[]> {
        this.cachedRows = await this.getPreviousLayer().getRows(refresh);

        if (this.toggleFirst && this.cachedRows.length && !this.rowIsToggled(this.cachedRows[0])) {
            this.toggleRow(this.cachedRows[0]);
        }

        return this.cachedRows.map((row) => {
            row.isToggled = this.toggledRows.findIndex((tr) => tr.object.equals(row.object)) !== -1;
            return row;
        });
    }

    public reset(): void {
        this.toggledRows = [];
    }

    protected rowIsToggled(row: TableRow): boolean {
        return this.toggledRows.some((r) => r.object.equals(row.object));
    }

}
