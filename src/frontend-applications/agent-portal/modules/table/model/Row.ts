/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Cell } from './Cell';
import { Table } from './Table';
import { RowObject } from './RowObject';
import { TableValue } from './TableValue';
import { ValueState } from './ValueState';
import { DataType } from '../../../model/DataType';
import { IdService } from '../../../model/IdService';
import { KIXObject } from '../../../model/kix/KIXObject';
import { SortOrder } from '../../../model/SortOrder';
import { UIFilterCriterion } from '../../../model/UIFilterCriterion';
import { EventService } from '../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { TableEvent } from './TableEvent';
import { TableSortUtil } from '../webapp/core/TableSortUtil';
import { TableEventData } from './TableEventData';

export class Row {

    private id: string;
    private cells: Cell[] = [];
    private selected: boolean = false;
    private canBeSelected: boolean = true;
    private expanded: boolean = false;
    private children: Row[] = [];
    private filteredChildren: Row[] = null;

    public filterMatch: boolean = true;

    public constructor(private table: Table, private rowObject?: RowObject) {
        const objectId = rowObject?.getObject()?.ObjectId || IdService.generateDateBasedId();
        this.id = `${table.getTableId()}-row-${objectId}`;

        if (rowObject) {
            rowObject.getValues().forEach((v) => this.cells.push(new Cell(this, v)));
            this.createChildren(rowObject.getChildren());
        }
    }

    private createChildren(children: RowObject[]): void {
        children?.forEach((c) => this.children.push(new Row(this.table, c)));
    }

    public initializeDisplayValues(): void {
        this.cells.forEach((c) => {
            c.initDisplayValue();
        });

        if (Array.isArray(this.children) && this.children.length) {
            this.children.forEach((cr) => cr.initializeDisplayValues());
        }
    }

    public getTable(): Table {
        return this.table;
    }

    public getRowId(): string {
        return this.id;
    }

    public getRowObject<T = any>(): RowObject<T> {
        return this.rowObject;
    }

    public setRowObject<T = any>(rowObject: RowObject): void {
        this.rowObject = rowObject;
        this.updateValues();
    }

    public getChildren(): Row[] {
        return this.filteredChildren ? this.filteredChildren : this.children;
    }

    public getCells(): Cell[] {
        return this.cells;
    }

    public getCell(property: string): Cell {
        return this.cells.find((c) => c.getProperty() === property);
    }

    public async filter(filterValue?: string, criteria?: UIFilterCriterion[]): Promise<boolean> {
        if (!this.isFilterDefined(filterValue, criteria)) {
            this.filteredChildren = null;
            this.children.forEach((cr) => cr.filter(filterValue, criteria));
            this.filterMatch = true;
            return true;
        }

        let criteriaMatch = true;

        if (criteria && criteria.length) {
            criteriaMatch = await this.checkCriteria(criteria);
        }

        if (criteriaMatch) {
            criteriaMatch = await this.checkFilterValue(filterValue);
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

        this.filterMatch = criteriaMatch;
        return criteriaMatch;
    }

    private async checkCriteria(criteria: UIFilterCriterion[]): Promise<boolean> {
        const rowObject = this.getRowObject();
        const object = rowObject ? rowObject.getObject() : null;

        let result = true;

        for (const c of criteria) {
            if (c.useObjectService) {
                result = object && object instanceof KIXObject
                    ? await KIXObjectService.checkFilterValue(object.KIXObjectType, object, c)
                    : false;
                break;
            } else {
                const match = await this.checkCellForCriteria(c);

                if (!match) {
                    result = false;
                    break;
                }
            }
        }

        return result;
    }

    private async checkCellForCriteria(criteria: UIFilterCriterion): Promise<boolean> {
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

    public select(
        selected: boolean = true, selectChildren: boolean = false, withoutFilter: boolean = false,
        silent: boolean = false
    ): void {
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

        if (selectChildren && this.children) {
            let children = this.children;

            if (!withoutFilter) {
                children = this.children.filter((c: Row) => c.filterMatch);
            }

            children.forEach((c) => c.select(selected, selectChildren, withoutFilter, silent));
        }

        if (notify && !silent) {
            EventService.getInstance().publish(
                TableEvent.ROW_SELECTION_CHANGED, new TableEventData(this.getTable().getTableId(), this.getRowId(),
                    null, this.getTable())
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
                TableEvent.ROW_SELECTABLE_CHANGED, new TableEventData(this.getTable().getTableId(), this.getRowId())
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
            EventService.getInstance().publish(TableEvent.ROW_TOGGLED,
                new TableEventData(this.getTable().getTableId(), this.getRowId(), null, this.getTable()));
        }
    }

    public updateValues(): void {
        this.getTable().getColumns().forEach((c) => {
            const cell = this.getCell(c.getColumnId());

            if (!cell) {
                this.cells.push(new Cell(this, new TableValue(c.getColumnId(), null)));
            }
        }

        );
    }

    public setValueState(state: ValueState): void {
        this.getRowObject().setValueState(state);
        EventService.getInstance().publish(
            TableEvent.ROW_VALUE_STATE_CHANGED, new TableEventData(this.getTable().getTableId(), this.getRowId())
        );
    }

    public addCell(value: TableValue): void {
        const cell = this.getCell(value.property);

        if (!cell) {
            this.cells.push(new Cell(this, value));
        }

        const children = this.getChildren();

        if (Array.isArray(children)) {
            children.forEach((r) => r.addCell(value));
        }
    }

    private isFilterDefined(value: string, criteria: UIFilterCriterion[]): boolean {
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

    public async sortChildren(columnId: string, sortOrder: SortOrder, dataType: DataType): Promise<void> {
        if (this.children && this.children.length) {
            this.children = await TableSortUtil.sort(this.children, columnId, sortOrder, dataType);

            const sortPromises = [];
            for (const row of this.children) {
                sortPromises.push(row.sortChildren(columnId, sortOrder, dataType));
            }
            await Promise.all(sortPromises);
        }
    }
}
