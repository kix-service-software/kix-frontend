import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/browser';
import { ITable, SelectionState, TableEvent } from '../../../../core/browser/table';
import { IEventSubscriber, EventService } from '../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private table: ITable;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        this.table = input.table;
        this.state.columns = this.table.getColumns();
    }

    public async onMount(): Promise<void> {
        this.eventSubscriberId = this.table.getTableId() + '-head';
        EventService.getInstance().subscribe(TableEvent.SELECTION_CHANGED, this);
        EventService.getInstance().subscribe(TableEvent.REFRESH, this);
        this.setCheckState();
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.SELECTION_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this);
    }

    public eventPublished(data: any, eventId: string, subscriberId?: string): void {
        if (
            (eventId === TableEvent.SELECTION_CHANGED || eventId === TableEvent.REFRESH)
            && data === this.table.getTableId()
        ) {
            this.setCheckState();
        }
    }

    private setCheckState(): void {
        const checkBox = (this as any).getEl('allCheck');
        if (this.table && checkBox) {
            const checkState = this.table.getRowSelectionState();
            let checked = true;
            let indeterminate = false;
            if (checkState !== SelectionState.ALL) {
                checked = false;
                if (checkState !== SelectionState.NONE) {
                    indeterminate = true;
                }
            }
            setTimeout(() => {
                checkBox.checked = checked;
                checkBox.indeterminate = indeterminate;
            }, 10);
        }
    }

    public getHeaderHeight(): string {
        const headRowHeight = this.table.getTableConfiguration().headerHeight;
        return (headRowHeight ? headRowHeight : 2.25).toString() + 'rem';
    }

    public isSelectable(): boolean {
        return this.table.getTableConfiguration().enableSelection;
    }

    public isToggleable(): boolean {
        return this.table.getTableConfiguration().toggle;
    }

    public selectionChanged(): void {
        if (this.table.getRowSelectionState() !== SelectionState.ALL) {
            this.table.selectAll();
        } else {
            this.table.selectNone();
        }
    }

    public firstColumnIsFixed(): boolean {
        return this.table.getTableConfiguration().fixedFirstColumn;
    }
}

module.exports = Component;
