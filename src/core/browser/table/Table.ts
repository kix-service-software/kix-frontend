import { IdService } from "../IdService";
import { ITable } from "./ITable";
import { Row } from "./Row";
import { Column } from "./Column";
import { IColumn } from "./IColumn";
import { ITableContentProvider } from "./ITableContentProvider";
import { IRowObject } from "./IRowObject";
import { IRow } from "./IRow";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { TableSortUtil } from "./TableSortUtil";
import { KIXObjectType, TableFilterCriteria, SortOrder } from "../../model";
import { SelectionState } from "./SelectionState";
import { EventService } from "../event";
import { TableEvent } from "./TableEvent";
import { TableConfiguration } from "./TableConfiguration";
import { TableValue } from "./TableValue";
import { ValueState } from "./ValueState";
import { TableEventData } from "./TableEventData";
import { SearchOperator } from "../SearchOperator";

export class Table implements ITable {

    private id: string = IdService.generateDateBasedId();
    private rows: IRow[] = [];
    private filteredRows: IRow[] = null;
    private columns: IColumn[] = [];
    private contentProvider: ITableContentProvider;
    private columnConfiguration: IColumnConfiguration[];
    private objectType: KIXObjectType;

    private filterValue: string;
    private filterCriteria: TableFilterCriteria[];

    private initialized: boolean = false;

    private sortColumnId: string;
    private sortOrder: SortOrder;

    public constructor(
        private tableKey: string,
        private tableConfiguration?: TableConfiguration,
        private contextId?: string
    ) { }

    public getTableId(): string {
        return this.id;
    }

    public getTableKey(): string {
        return this.tableKey;
    }

    public getContextId(): string {
        return this.contextId;
    }

    public getTableConfiguration(): TableConfiguration {
        return this.tableConfiguration;
    }

    public getObjectType(): KIXObjectType {
        return this.objectType;
    }

    public setContentProvider(contentProvider: ITableContentProvider): void {
        this.contentProvider = contentProvider;
    }

    public setColumnConfiguration(columnConfiguration: IColumnConfiguration[]) {
        this.columnConfiguration = columnConfiguration;
    }

    public async initialize(): Promise<void> {
        if (!this.initialized) {
            if (this.contentProvider) {
                await this.contentProvider.initialize();
                await this.loadRowData();
                this.objectType = this.tableConfiguration
                    ? this.tableConfiguration.objectType
                    : this.contentProvider.getObjectType();
            }

            this.columns = [];
            if (this.columnConfiguration) {
                this.columnConfiguration.forEach((c) => this.createColumn(c));
            }

            if (this.sortColumnId && this.sortOrder) {
                await this.sort(this.sortColumnId, this.sortOrder);
            }

            this.initialized = true;
        }
    }

    private async loadRowData(): Promise<void> {
        this.rows = [];
        this.filteredRows = null;
        if (this.contentProvider) {
            const data = await this.contentProvider.loadData();
            const rows = [];
            data.forEach((d) => rows.push(this.createRow(d)));
            this.rows = rows;
            if (this.tableConfiguration &&
                this.tableConfiguration.toggle &&
                this.tableConfiguration.toggleOptions.toggleFirst) {
                if (this.rows.length) {
                    this.rows[0].expand(true);
                }
            }
        }
    }

    public createRow(tableObject?: IRowObject): IRow {
        const row = new Row(this, tableObject);
        this.rows.push(row);
        return row;
    }

    private createColumn(columnConfiguration: IColumnConfiguration): IColumn {
        const column = new Column(this, columnConfiguration);

        this.rows.forEach((r) => {
            const cell = r.getCell(column.getColumnId());
            if (!cell) {
                r.addCell(new TableValue(column.getColumnId(), null));
            }
        });

        this.columns.push(column);
        return column;
    }

    public getRows(all: boolean = false): IRow[] {
        if (all) {
            return this.rows;
        }
        return this.filteredRows ? [...this.filteredRows] : [...this.rows];
    }

    public getSelectedRows(all?: boolean): IRow[] {
        return this.getRows(all).filter((r) => r.isSelected());
    }

    public getRow(rowId: string): IRow {
        // TODO: neue Zeile liefern, nicht die Referenz
        return this.rows.find((r) => r.getRowId() === rowId);
    }

    public removeRows(rowIds: string[]): Row[] {
        const removedRows = [];
        this.rows = this.rows.filter((r) => {
            if (rowIds.some((id) => id === r.getRowId())) {
                removedRows.push(r);
                return false;
            } else {
                return true;
            }
        });
        return removedRows;
    }

    public addRows(addRows: Row[], index: number = this.rows.length): void {
        const newRows = [];
        addRows.forEach((r) => {
            if (
                !newRows.some((nr) => nr.getRowId() === r.getRowId())
                && !this.rows.some((kr) => kr.getRowId() === r.getRowId())
            ) {
                // TODO: new Row erzeugen, um Referenzen zu vermeiden
                newRows.push(r);
            }
        });
        if (!!newRows.length) {
            this.rows.splice(index, 0, ...newRows);
        }
    }

    public replaceRows(replaceRows: Array<[string, Row]>): Row[] {
        let replacedRows = [];
        replaceRows.forEach((r) => {
            let replaceRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[0]);
            if (replaceRowIndex !== -1) {
                const checkNewRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[1].getRowId());
                if (checkNewRowIndex !== -1) {
                    this.rows.splice(checkNewRowIndex, 1);
                    if (checkNewRowIndex < replaceRowIndex) {
                        replaceRowIndex = this.rows.findIndex((kr) => kr.getRowId() === r[0]);
                    }
                }

                // TODO: new Row erzeugen, um Referenzen zu vermeiden
                replacedRows = [...replacedRows, ...this.rows.splice(replaceRowIndex, 1, r[1])];
            }
        });
        return replacedRows;
    }

    public getColumns(): IColumn[] {
        return [...this.columns];
    }

    public getColumn(columnId: string): IColumn {
        return this.columns.find((r) => r.getColumnId() === columnId);
    }

    public removeColumns(columnIds: string[]): IColumn[] {
        const removedColumns = [];
        this.columns = this.columns.filter((c) => {
            if (columnIds.some((id) => id === c.getColumnId())) {
                removedColumns.push(c);
                return false;
            } else {
                return true;
            }
        });
        return removedColumns;
        // TODO: notify listener if !!removedColumns.length
    }

    public addColumns(columns: IColumnConfiguration[]): void {
        if (!this.initialized) {
            if (!this.columnConfiguration) {
                this.columnConfiguration = [...columns];
            } else {
                this.columnConfiguration.push(...columns);
            }
        } else {
            columns.forEach((c) => {
                if (!this.hasColumn(c.property)) {
                    this.createColumn(c);
                    this.updateRowValues();
                }
            });
            this.reload();
        }
    }

    private updateRowValues(): void {
        this.rows.forEach((r) => r.updateValues());
    }

    private hasColumn(id: string): boolean {
        return this.columns.some((kr) => kr.getColumnId() === id);
    }

    public replaceColumns(replaceColumns: Array<[string, IColumn]>): IColumn[] {
        let replacedColumns = [];
        replaceColumns.forEach((r) => {
            let replaceColumnIndex = this.columns.findIndex((kr) => kr.getColumnId() === r[0]);
            if (replaceColumnIndex !== -1) {
                const checkNewColumnIndex = this.columns.findIndex((kr) => kr.getColumnId() === r[1].getColumnId());
                if (checkNewColumnIndex !== -1) {
                    this.columns.splice(checkNewColumnIndex, 1);
                    if (checkNewColumnIndex < replaceColumnIndex) {
                        replaceColumnIndex = this.columns.findIndex((kr) => kr.getColumnId() === r[0]);
                    }
                }

                replacedColumns = [...replacedColumns, ...this.columns.splice(replaceColumnIndex, 1, r[1])];
            }
        });
        return replacedColumns;
    }

    public setFilter(filterValue?: string, criteria?: TableFilterCriteria[]): void {
        this.filterValue = filterValue;
        this.filterCriteria = criteria;
    }

    public async filter(): Promise<void> {
        if (this.isFilterDefined(this.filterValue, this.filterCriteria)) {
            this.filteredRows = [];
            const rows = [...this.rows];
            for (const row of rows) {
                const match = await row.filter(this.filterValue, this.filterCriteria);
                if (match) {
                    this.filteredRows.push(row);
                }
            }
        } else {
            this.filteredRows = null;
            for (const row of this.rows) {
                await row.filter(null, null);
            }
        }

        await this.filterColumns();

        EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
        EventService.getInstance().publish(TableEvent.TABLE_FILTERED, new TableEventData(this.getTableId()));
    }

    private async filterColumns(): Promise<void> {
        for (const column of this.getColumns()) {
            const filter: [string, TableFilterCriteria[]] = column.getFilter();
            if (this.isFilterDefined(filter[0], filter[1])) {
                const rows: IRow[] = [];
                if (filter[0] && filter[0] !== '') {
                    filter[1] = [
                        new TableFilterCriteria(column.getColumnId(), SearchOperator.CONTAINS, filter[0])
                    ];
                }
                for (const row of this.getRows()) {
                    const match = await row.filter(null, filter[1]);
                    if (match) {
                        rows.push(row);
                    }
                }
                this.filteredRows = rows;
            }
        }
    }

    private isFilterDefined(value: string, criteria: TableFilterCriteria[]): boolean {
        return (value && value !== '') || (criteria && criteria.length !== 0);
    }

    public async sort(columnId: string, sortOrder: SortOrder): Promise<void> {
        this.sortColumnId = columnId;
        this.sortOrder = sortOrder;

        this.getColumns().forEach((c) => c.setSortOrder(null));
        const column = this.getColumn(columnId);
        if (column) {
            column.setSortOrder(sortOrder);
            if (this.filteredRows) {
                this.filteredRows = await TableSortUtil.sort(
                    this.filteredRows, columnId, sortOrder, column.getColumnConfiguration().dataType
                );
            } else {
                this.rows = await TableSortUtil.sort(
                    this.rows, columnId, sortOrder, column.getColumnConfiguration().dataType
                );
            }
            EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
            EventService.getInstance().publish(
                TableEvent.SORTED, new TableEventData(this.getTableId(), null, columnId)
            );
        }
    }

    public setRowSelection(rowIds: string[]): void {
        this.getRows(true).forEach((r) => {
            if (rowIds.some((rId) => rId === r.getRowId())) {
                r.select();
            } else {
                r.select(false);
            }
        });
    }

    public selectAll(withoutFilter: boolean = false): void {
        this.getRows(withoutFilter).forEach((r) => r.select());
    }

    public selectNone(withoutFilter: boolean = false): void {
        this.getRows(withoutFilter).forEach((r) => r.select(false));
    }

    public selectRowByObject(object: any, select?: boolean): void {
        const row = this.getRowByObject(object);
        if (row) {
            row.select(select);
        }
    }

    public setRowsSelectableByObject(objects: any[], selectable: boolean): void {
        objects.forEach((o) => {
            const row = this.getRowByObject(o);
            if (row) {
                row.selectable(selectable);
            }
        });
    }

    private getRowByObject(object: any): IRow {
        return this.rows.filter((r) => r.getRowObject() !== null && typeof r.getRowObject() !== 'undefined')
            .find((r) => r.getRowObject().getObject() && r.getRowObject().getObject().equals(object));
    }

    public getRowSelectionState(all?: boolean): SelectionState {
        const selectableCount = this.getRows(all).filter((r) => r.isSelectable()).length;
        const selectedCount = this.getRows(all).filter((r) => r.isSelected()).length;
        let selectionState = SelectionState.ALL;
        if (selectedCount < selectableCount) {
            selectionState = SelectionState.INDETERMINATE;
        }
        if (selectedCount === 0) {
            selectionState = SelectionState.NONE;
        }
        return selectionState;
    }

    public async reload(keepSelection: boolean = false): Promise<void> {
        let selectedRows: IRow[] = [];
        if (keepSelection) {
            selectedRows = this.getSelectedRows(true);
        }
        await this.loadRowData();
        if (keepSelection && !!selectedRows.length) {
            // TODO: auch ohne Object sollte es möglich sein, die Selektion zu erhalten
            selectedRows.map(
                (r) => r.getRowObject().getObject()
            ).forEach(
                (o) => this.selectRowByObject(o)
            );
        }
        EventService.getInstance().publish(TableEvent.REFRESH, new TableEventData(this.getTableId()));
    }

    public switchColumnOrder(): void {
        this.columns = this.columns.reverse();
        if (this.getTableConfiguration().fixedFirstColumn) {
            const column = this.columns.splice(this.columns.length - 1, 1);
            this.columns.unshift(column[0]);
        }

        EventService.getInstance().publish(TableEvent.RERENDER_TABLE, new TableEventData(this.getTableId()));
    }

    public resetFilter(): void {
        this.setFilter(null, null);
        this.getColumns().forEach((c) => c.filter(null, null));
    }

    public isFiltered(): boolean {
        return this.isFilterDefined(this.filterValue, this.filterCriteria) ||
            this.getColumns().some((c) => c.isFiltered());
    }

    public setRowObjectValues(values: Array<[any, [string, any]]>): void {
        values.forEach((v) => {
            const row = this.getRowByObject(v[0]);
            if (row) {
                const value = v[1];
                row.getRowObject().addValue(new TableValue(value[0], value[1]));
                const cell = row.getCell(value[0]);
                if (cell) {
                    cell.setValue(new TableValue(value[0], value[1]));
                } else {
                    row.addCell(new TableValue(value[0], value[1]));
                }
                EventService.getInstance().publish(
                    TableEvent.ROW_VALUE_CHANGED,
                    new TableEventData(this.getTableId(), row.getRowId())
                );
            }
        });
    }

    public setRowObjectValueState(objects: any[], state: ValueState): void {
        objects.forEach((o) => {
            const row = this.getRowByObject(o);
            if (row) {
                row.setValueState(state);
            }
        });
    }

    public getRowByObjectId(objectId: string | number): IRow {
        const row = this.rows.find((r) => {
            const object = r.getRowObject().getObject();
            return object && object.ObjectId === objectId;
        });
        return row;
    }

    public destroy(): void {
        this.contentProvider.destroy();
    }

    public getRowCount(all?: boolean): number {
        let count = 0;
        this.getRows(all).forEach((r) => count += r.getRowCount());
        return count;
    }

}
