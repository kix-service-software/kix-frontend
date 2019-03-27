import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, IColumn, BrowserUtil, LabelService, TableEvent, TableEventData
} from '../../../../../core/browser';
import { SortOrder } from '../../../../../core/model';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    public size: number;
    private startOffset: number;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.column = input.column;
        this.state.isSorted = this.state.column.getSortOrder() ? true : false;
        this.state.sortOrderDown = this.isSortOrderDown();
        this.setSize();
    }

    public async onInput(input: any): Promise<void> {
        this.state.column = input.column;
        this.state.isSorted = this.state.column.getSortOrder() ? true : false;
        await this.setIconAndTitle();
        this.setSize();
    }

    public async onMount(): Promise<void> {
        await this.setIconAndTitle();

        this.eventSubscriberId = this.state.column.getTable().getTableId() + '-' + this.state.column.getColumnId();
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

    private async setIconAndTitle(): Promise<void> {
        if (this.state.column) {
            const table = this.state.column.getTable();
            const objectType = table ? table.getObjectType() : null;
            if (objectType && this.state.column.getColumnConfiguration().showColumnIcon) {
                this.state.icon = await LabelService.getInstance().getPropertyIcon(
                    this.state.column.getColumnId(), objectType,
                );
            }

            if (this.state.column.getColumnConfiguration().defaultText) {
                this.state.title = await TranslationService.translate(
                    this.state.column.getColumnConfiguration().defaultText
                );
            } else {
                this.state.title = await LabelService.getInstance().getPropertyText(
                    this.state.column.getColumnId(), objectType, true
                );
            }
        }
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.SORTED
            && data
            && data.tableId && data.tableId === this.state.column.getTable().getTableId()
        ) {
            if (data.columnId && data.columnId === this.state.column.getColumnId()) {
                this.state.isSorted = true;
            } else {
                this.state.isSorted = false;
            }
            this.state.sortOrderDown = this.isSortOrderDown();
        }
    }

    private setSize(): void {
        this.size = this.state.column ? this.state.column.getColumnConfiguration().size : 100;
        const minWidth = this.getMinWidth();
        if (minWidth > this.size) {
            this.size = minWidth;
        }
        this.state.size = this.size;
    }

    private isSortOrderDown(): boolean {
        return this.state.column.getSortOrder() && this.state.column.getSortOrder() === SortOrder.DOWN;
    }

    public sort(): void {
        if (!this.state.filterIsShown) {
            if (this.state.column.getColumnConfiguration().sortable) {
                if (this.isSortOrderDown()) {
                    this.state.column.getTable().sort(this.state.column.getColumnId(), SortOrder.UP);
                } else {
                    this.state.column.getTable().sort(this.state.column.getColumnId(), SortOrder.DOWN);
                }
            }
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
            this.state.column.setSize(this.size);
            this.state.size = this.size;
            EventService.getInstance().publish(
                TableEvent.COLUMN_RESIZED,
                new TableEventData(this.state.column.getTable().getTableId(), null, this.state.column.getColumnId())
            );
        }
    }

    private browserFontSize;
    private getMinWidth(headerColumn?): number {
        if (!this.browserFontSize) {
            this.browserFontSize = BrowserUtil.getBrowserFontsize();
        }
        let minWidth: number = (2.5 * this.browserFontSize);

        if (headerColumn) {
            const minWidthString = getComputedStyle(headerColumn).getPropertyValue("min-width");
            if (minWidthString) {
                minWidth = Number(minWidthString.replace('px', ''));
            }
        }

        const config = this.state.column.getColumnConfiguration();
        if (config.showColumnIcon || config.showColumnTitle) {
            if (config.filterable) {
                minWidth += this.browserFontSize * 1.125;
            }
            if (config.sortable) {
                minWidth += this.browserFontSize * 1.125;
            }
        } else if (config.filterable && config.sortable) {
            minWidth += this.browserFontSize * 1.125;
        }

        return minWidth;
    }

    public columnFilterHovered(hover: boolean = false): void {
        this.state.filterHovered = hover;
    }

    public changeFilterShownState(shown: boolean = false): void {
        this.state.filterIsShown = shown;
    }
}

module.exports = Component;
