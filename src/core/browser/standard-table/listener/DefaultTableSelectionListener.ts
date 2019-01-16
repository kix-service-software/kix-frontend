import { ITableSelectionListener, TableRow } from '../..';
import { KIXObject } from '../../../model';

export class DefaultTableSelectionListener<T extends KIXObject> implements ITableSelectionListener<T> {

    private selectedRows: Array<TableRow<T>> = [];
    private allSelected: boolean = false;
    private listeners: Array<(objects: T[]) => void> = [];

    public selectionChanged(row: TableRow<T>, selected: boolean): void {
        if (selected) {
            const selectedRow = this.selectedRows.find((sR) => sR.object.ObjectId === row.object.ObjectId);
            if (!selectedRow) {
                this.selectedRows.push(row);
            }
        } else {
            const index = this.selectedRows.findIndex((sR) => sR.object.ObjectId === row.object.ObjectId);
            if (index !== -1) {
                this.selectedRows.splice(index, 1);
            }
        }

        this.notifyListener();
    }

    public objectSelectionChanged(object: KIXObject<T>, selected: boolean): void {
        const row = this.selectedRows.find((r) => r.object.ObjectId === object.ObjectId);
        if (row) {
            this.selectionChanged(row, selected);
        }
    }

    public selectAll(rows: Array<TableRow<T>>): void {
        this.selectedRows = rows;
        this.allSelected = true;
        this.notifyListener();
    }

    public selectNone(): void {
        this.selectedRows = [];
        this.allSelected = false;
        this.notifyListener();
    }

    public isRowSelected(row: TableRow<T>): boolean {
        return this.selectedRows.some((sR) => sR.object.ObjectId === row.object.ObjectId);
    }

    public isAllSelected(): boolean {
        return this.allSelected;
    }

    public getSelectedObjects(): T[] {
        return this.selectedRows.map((r) => r.object);
    }

    public addListener(listener: (objects: T[]) => void): void {
        this.listeners.push(listener);
    }

    private notifyListener(): void {
        for (const listener of this.listeners) {
            listener(this.getSelectedObjects());
        }
    }

    public updateSelections(updatedRows: Array<TableRow<T>> = []): void {
        this.selectedRows = updatedRows.filter((r) => this.isRowSelected(r));
        this.notifyListener();
    }
}
