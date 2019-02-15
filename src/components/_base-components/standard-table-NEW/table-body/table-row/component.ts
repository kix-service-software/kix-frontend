import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, BrowserUtil } from '../../../../../core/browser';
import { IColumn, ICell, TableEvent } from '../../../../../core/browser/table';
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
            EventService.getInstance().subscribe(TableEvent.SELECTION_CHANGED, this);
            EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this);
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.SELECTION_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
    }

    public eventPublished(data: any, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.SELECTION_CHANGED && data === this.state.row.getTable().getTableId()) {
            this.state.selected = this.state.row.isSelected();
        }
        if (eventId === TableEvent.ROW_TOGGLED && data === this.state.row.getTable().getTableId()) {
            this.state.open = this.state.row.isExpanded();
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

}

module.exports = Component;
