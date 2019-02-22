import { IdService } from "../IdService";
import { IRow } from "./IRow";
import { IRowObject } from "./IRowObject";
import { ICell } from "./ICell";
import { Cell } from "./Cell";
import { ITable } from "./ITable";
import { TableFilterCriteria, KIXObject } from "../../model";
import { KIXObjectService } from "../kix";
import { EventService } from "../event";
import { TableEvent } from "./TableEvent";
import { RowObject } from "./RowObject";
import { TableValue } from "./TableValue";
import { ValueState } from "./ValueState";
import { TableEventData } from "./TableEventData";

export class Row<T = any> implements IRow<T> {

    private id: string;
    private cells: ICell[] = [];
    private selected: boolean = false;
    private canBeSelected: boolean = true;
    private expanded: boolean = false;
    private children: IRow[] = [];
    private filteredChildren: IRow[] = null;

    public constructor(
        private table: ITable, private rowObject?: IRowObject
    ) {
        this.id = IdService.generateDateBasedId(table.getTableId() + '-row-');
        if (rowObject) {
            rowObject.getValues().forEach((v) => this.cells.push(new Cell(this, v)));
            this.createChildren(rowObject.getChildren());
        }
    }

    private createChildren(children: RowObject[]): void {
        children.forEach((c) => {
            this.children.push(new Row(this.table, c));
        });
    }

    public getTable(): ITable {
        return this.table;
    }

    public getRowId(): string {
        return this.id;
    }

    public getRowObject(): IRowObject<T> {
        return this.rowObject;
    }

    public getChildren(): IRow[] {
        return this.filteredChildren ? this.filteredChildren : this.children;
    }

    public getCells(): ICell[] {
        return this.cells;
    }

    public getCell(property: string): ICell {
        return this.cells.find((c) => c.getProperty() === property);
    }

    public async filter(filterValue?: string, criteria?: TableFilterCriteria[]): Promise<boolean> {
        if (!this.isFilterDefined(filterValue, criteria)) {
            this.filteredChildren = null;
            return true;
        }

        let criteriaMatch = true;
        if (criteria && criteria.length) {
            criteriaMatch = await this.checkCriteria(criteria);
        }

        if (criteriaMatch) {
            criteriaMatch = criteriaMatch && await this.checkFilterValue(filterValue);
        }

        if (this.children && this.children.length) {
            this.filteredChildren = [];
            const children = [...this.children];
            for (const child of children) {
                const childMatch = await child.filter(filterValue, criteria);
                if (childMatch) {
                    this.filteredChildren.push(child);
                }
            }

            if (!criteriaMatch) {
                criteriaMatch = this.filteredChildren.length > 0;
            }
        }

        return criteriaMatch;
    }

    private async checkCriteria(criteria: TableFilterCriteria[]): Promise<boolean> {
        const rowObject = this.getRowObject();
        const object = rowObject ? rowObject.getObject() : null;

        let result = true;

        for (const c of criteria) {
            if (c.useObjectService) {
                result = object && object instanceof KIXObject
                    ? KIXObjectService.checkFilterValue(object.KIXObjectType, object, c)
                    : false;
                break;
            } else {
                const match = await this.checkCells(c);
                if (!match) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }

    private async checkCells(criteria: TableFilterCriteria): Promise<boolean> {
        const cell = this.getCell(criteria.property);
        const column = this.getTable().getColumn(criteria.property);
        if (cell && column) {
            const match = await cell.filter(null, [criteria]);
            if (!match) {
                return false;
            }
        } else {
            return false;
        }

        return true;
    }

    private async checkFilterValue(filterValue: string): Promise<boolean> {
        const columns = this.getTable().getColumns();
        for (const column of columns) {
            const cell = this.getCell(column.getColumnId());
            const match = cell ? await cell.filter(filterValue, null) : null;
            if (match) {
                return true;
            }
        }
        return false;
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public select(selected: boolean = true): void {
        let notify = false;

        if (selected) {
            if (this.isSelectable() && !this.isSelected()) {
                this.selected = true;
                notify = true;
            }
        } else {
            if (this.isSelected()) {
                this.selected = false;
                notify = true;
            }
        }

        if (notify) {
            EventService.getInstance().publish(
                TableEvent.ROW_SELECTION_CHANGED,
                new TableEventData(this.getTable().getTableId(), this.getRowId())
            );
        }
    }

    public isSelectable(): boolean {
        return this.canBeSelected;
    }

    public selectable(selectable: boolean = true): void {
        let notify = false;

        if (selectable) {
            if (!this.isSelectable()) {
                this.canBeSelected = true;
                notify = true;
            }
        } else {
            if (this.isSelectable()) {
                this.canBeSelected = false;
                if (this.isSelected()) {
                    this.select(false);
                }
                notify = true;
            }
        }

        if (notify) {
            EventService.getInstance().publish(
                TableEvent.ROW_SELECTABLE_CHANGED,
                new TableEventData(this.getTable().getTableId(), this.getRowId())
            );
        }
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public expand(expanded: boolean = true): void {
        let notify = false;

        if (expanded) {
            if (!this.isExpanded()) {
                this.expanded = true;
                notify = true;
            }
        } else {
            if (this.isExpanded()) {
                this.expanded = false;
                notify = true;
            }
        }

        if (notify) {
            EventService.getInstance().publish(
                TableEvent.ROW_TOGGLED,
                new TableEventData(this.getTable().getTableId(), this.getRowId(), null, this.getTable())
            );
        }
    }

    public updateValues(): void {
        this.getTable().getColumns().forEach((c) => {
            const cell = this.getCell(c.getColumnId());
            if (!cell) {
                this.cells.push(new Cell(this, new TableValue(c.getColumnId(), null)));
            }
        });
    }

    public setValueState(state: ValueState): void {
        this.getRowObject().setValueState(state);
        EventService.getInstance().publish(
            TableEvent.ROW_VALUE_STATE_CHANGED,
            new TableEventData(this.getTable().getTableId(), this.getRowId())
        );
    }

    public addCell(value: TableValue): void {
        const cell = this.getCell(value.property);
        if (!cell) {
            this.cells.push(new Cell(this, value));
        }
    }

    private isFilterDefined(value: string, criteria: TableFilterCriteria[]): boolean {
        return (value && value !== '') || (criteria && criteria.length !== 0);
    }

    public getRowCount(): number {
        let count = 1;

        if (this.filteredChildren) {
            this.filteredChildren.forEach((c) => count += c.getRowCount());
        } else {
            this.children.forEach((c) => count += c.getRowCount());
        }

        return count;
    }
}
