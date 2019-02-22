import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../core/browser';
import {
    IColumn, ICell, TableEvent, TableEventData, TableCSSHandlerRegsitry
} from '../../../../../core/browser/table';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.row = input.row;
        if (this.state.row) {
            this.state.selected = this.state.row.isSelected();
            this.state.selectable = this.state.row.isSelectable();
            this.state.open = this.state.row.isExpanded();
            this.state.children = this.state.row.getChildren();
        }
    }

    public async onMount(): Promise<void> {
        if (this.state.row) {
            this.eventSubscriberId = this.state.row.getTable().getTableId() + '-' + this.state.row.getRowId();
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_SELECTABLE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_VALUE_CHANGED, this);
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTABLE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_CHANGED, this);
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (data && data.tableId === this.state.row.getTable().getTableId()) {
            if (eventId === TableEvent.ROW_SELECTION_CHANGED) {
                this.state.selected = this.state.row.isSelected();
            }
            if (eventId === TableEvent.ROW_SELECTABLE_CHANGED) {
                this.state.selectable = this.state.row.isSelectable();
            }
            if (eventId === TableEvent.ROW_TOGGLED && data.rowId === this.state.row.getRowId()) {
                this.state.open = this.state.row.isExpanded();
            }
            if (
                (eventId === TableEvent.ROW_VALUE_STATE_CHANGED || eventId === TableEvent.ROW_VALUE_CHANGED)
                && data.rowId === this.state.row.getRowId()
            ) {
                (this as any).setStateDirty('row');
            }
        }
    }

    public toggleRow(): void {
        this.state.row.expand(!this.state.open);
    }

    public changeSelect(event: any): void {
        if (this.state.row.isSelected()) {
            this.state.row.select(false);
        } else {
            this.state.row.select();
        }
    }

    public getColumns(): IColumn[] {
        return this.state.row ? this.state.row.getTable().getColumns() : [];
    }

    public getCell(columnId: string): ICell {
        return this.state.row.getCell(columnId);
    }

    public getFullColumnCount(isCheckable: boolean, isToggleable: boolean): number {
        let columnLength = this.getColumns().length + 1;
        if (isCheckable) {
            columnLength++;
        }
        if (isToggleable) {
            columnLength++;
        }
        return columnLength;
    }

    public firstColumnIsFixed(): boolean {
        return this.state.row.getTable().getTableConfiguration().fixedFirstColumn;
    }

    public getRowClasses(): string[] {
        const object = this.state.row.getRowObject().getObject();
        const stateClass = [];

        if (this.state.open) {
            stateClass.push('opened');
        }

        if (this.firstColumnIsFixed()) {
            stateClass.push("fist-column-fixed");
        }

        if (object) {
            const objectType = this.state.row.getTable().getObjectType();
            const cssHandler = TableCSSHandlerRegsitry.getCSSHandler(objectType);
            if (cssHandler) {
                const classes = cssHandler.getRowCSSClasses(object);
                classes.forEach((c) => stateClass.push(c));
            }
        }

        return stateClass;
    }

}

module.exports = Component;
