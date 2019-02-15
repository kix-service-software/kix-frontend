import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, IColumn, BrowserUtil, LabelService, TableEvent
} from '../../../../../core/browser';
import { SortOrder } from '../../../../../core/model';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    public column: IColumn;
    public size: number;
    private startOffset: number;
    private filterClicked: boolean;


    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.column = input.column;
        this.state.isSorted = this.column.getSortOrder() ? true : false;
        this.state.sortOrderDown = this.isSortOrderDown();
        this.setSize();
    }

    public onInput(input: any): void {
        this.column = input.column;
        this.state.isSorted = this.column.getSortOrder() ? true : false;
        this.setSize();
    }

    public async onMount(): Promise<void> {
        if (this.column) {
            const table = this.column.getTable();
            const objectType = table ? table.getObjectType() : null;
            if (objectType && this.column.getColumnConfiguration().showColumnIcon) {
                this.state.icon = await LabelService.getInstance().getPropertyIcon(
                    this.column.getColumnId(), objectType,
                );
            }

            if (this.column.getColumnConfiguration().defaultText) {
                this.state.title = this.column.getColumnConfiguration().defaultText;
            } else {
                this.state.title = await LabelService.getInstance().getPropertyText(
                    this.column.getColumnId(), objectType, true
                );
            }
        }

        this.eventSubscriberId = this.column.getTable().getTableId() + '-' + this.column.getColumnId();
        EventService.getInstance().subscribe(TableEvent.SORTED, this);

        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));

        this.state.loading = false;
    }

    public onDestroy(): void {
        document.removeEventListener('mousemove', this.mousemove.bind(this));
        document.removeEventListener('mouseup', this.mouseup.bind(this));
        EventService.getInstance().unsubscribe(TableEvent.SORTED, this);
    }

    public eventPublished(data: any, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.SORTED
            && data
            && data.tableId && data.tableId === this.column.getTable().getTableId()
        ) {
            if (data.columnId && data.columnId === this.column.getColumnId()) {
                this.state.isSorted = true;
            } else {
                this.state.isSorted = false;
            }
            this.state.sortOrderDown = this.isSortOrderDown();
        }
    }

    private setSize(): void {
        this.size = this.column ? this.column.getColumnConfiguration().size : 100;
        const minWidth = this.getMinWidth();
        if (minWidth > this.size) {
            this.size = minWidth;
        }
    }

    public columnFilterClicked(): void {
        this.filterClicked = true;
    }

    public columnFilterHovered(hover: boolean = false): void {
        this.state.filterHovered = hover;
    }

    private isSortOrderDown(): boolean {
        return this.column.getSortOrder() && this.column.getSortOrder() === SortOrder.DOWN;
    }

    public sort(): void {
        if (!this.filterClicked) {
            if (this.column.getColumnConfiguration().sortable) {
                if (this.isSortOrderDown()) {
                    this.column.getTable().sort(this.column.getColumnId(), SortOrder.UP);
                } else {
                    this.column.getTable().sort(this.column.getColumnId(), SortOrder.DOWN);
                }
            }
        } else {
            this.filterClicked = false;
        }
    }

    public mousedown(event: any): void {
        if (event.button === 0) {
            this.startOffset = event.pageX;
            this.state.resizeActive = true;
        }
    }

    private resizeX: number;
    private mousemove(event: any): void {
        if (this.state.resizeActive) {
            document.body.classList.add('no-select');
            if (this.resizeX !== event.pageX) {
                this.resizeX = event.pageX;
                const headerColumn = (this as any).getEl();
                this.size = headerColumn.offsetWidth + this.resizeX - this.startOffset;
                const minWidth = this.getMinWidth(headerColumn);
                if (minWidth > this.size) {
                    this.size = minWidth;
                }
                this.startOffset = this.resizeX;
                headerColumn.style.width = this.size + 'px';
            }
        }
    }

    private async mouseup(): Promise<void> {
        if (this.state.resizeActive) {
            document.body.classList.remove('no-select');
            this.startOffset = undefined;
            this.state.resizeActive = false;
            this.column.setSize(this.size);
        }
    }

    private getMinWidth(headerColumn?): number {
        const browserFontSize = BrowserUtil.getBrowserFontsize();
        let minWidth: number = (2.875 * browserFontSize);

        if (headerColumn) {
            const minWidthString = getComputedStyle(headerColumn).getPropertyValue("min-width");
            if (minWidthString) {
                minWidth = Number(minWidthString.replace('px', ''));
            }
        }

        if (this.column.getColumnConfiguration().filterable) {
            minWidth += browserFontSize;
        }
        if (this.column.getColumnConfiguration().sortable) {
            minWidth += browserFontSize;
        }
        return minWidth;
    }
}

module.exports = Component;
