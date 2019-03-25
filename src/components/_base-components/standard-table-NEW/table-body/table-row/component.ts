import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../core/browser';
import {
    IColumn, ICell, TableEvent, TableEventData, TableCSSHandlerRegistry
} from '../../../../../core/browser/table';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    private observer: IntersectionObserver;

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
            this.prepareObserver();
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
            this.prepareObserver();
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTABLE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_STATE_CHANGED, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_VALUE_CHANGED, this);

        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private prepareObserver(): void {
        if (this.supportsIntersectionObserver()) {
            this.state.show = false;
            const row = (this as any).getEl();
            if (row) {
                if (this.observer) {
                    this.observer.disconnect();
                }
                this.observer = new IntersectionObserver(this.intersectionCallback.bind(this), {
                    threshold: [0, 1]
                });
                this.observer.observe(row);
            }
        } else {
            this.state.show = true;
        }
    }

    private supportsIntersectionObserver(): boolean {
        return 'IntersectionObserver' in global
            && 'IntersectionObserverEntry' in global
            && 'intersectionRatio' in IntersectionObserverEntry.prototype;
    }

    private intersectionCallback(entries, observer): void {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.state.show = true;
                this.observer.disconnect();
            }
        });
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
            const cssHandler = TableCSSHandlerRegistry.getCSSHandler(objectType);
            if (cssHandler) {
                const classes = cssHandler.getRowCSSClasses(object);
                classes.forEach((c) => stateClass.push(c));
            }
        }

        return stateClass;
    }

}

module.exports = Component;
