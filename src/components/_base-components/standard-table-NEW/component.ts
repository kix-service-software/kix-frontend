import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent, TableEvent, ContextService, ITable, BrowserUtil, IColumn, IRow, TableEventData
} from '../../../core/browser';
import { EventService, IEventSubscriber } from '../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;
    private browserFontSize: number;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.browserFontSize = BrowserUtil.getBrowserFontsize();
    }

    public onInput(input: any): void {
        if (
            (!this.state.table && input.table)
            || (input.table && this.state.table.getTableId() !== input.table.getTableId())
        ) {
            if (this.state.table && input.table && this.state.table.getTableId() !== input.table.getTableId()) {
                this.state.table.destroy();
            }
            this.init(input.table);
        }
    }

    private async init(table: ITable): Promise<void> {
        this.state.table = null;

        this.state.loading = true;
        this.state.table = table;

        this.eventSubscriberId = this.state.table.getTableId();

        await this.state.table.initialize();
        this.state.rows = this.state.table.getRows();
        this.state.columns = this.state.table.getColumns();
        this.setTableHeight();

        this.state.loading = false;
        EventService.getInstance().publish(
            TableEvent.TABLE_INITIALIZED,
            new TableEventData(this.state.table.getTableId())
        );
        EventService.getInstance().publish(TableEvent.TABLE_READY, new TableEventData(this.state.table.getTableId()));
    }

    public async onMount(): Promise<void> {
        EventService.getInstance().subscribe(TableEvent.REFRESH, this);
        EventService.getInstance().subscribe(TableEvent.RERENDER_TABLE, this);
        EventService.getInstance().subscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().subscribe(TableEvent.SORTED, this);
        EventService.getInstance().subscribe(TableEvent.SCROLL_TO_AND_TOGGLE_ROW, this);
    }

    public onUpdate(): void {
        // nothing
    }

    public onDestroy(): void {
        this.state.table.destroy();
        EventService.getInstance().unsubscribe(TableEvent.REFRESH, this);
        EventService.getInstance().unsubscribe(TableEvent.RERENDER_TABLE, this);
        EventService.getInstance().unsubscribe(TableEvent.ROW_TOGGLED, this);
        EventService.getInstance().unsubscribe(TableEvent.SORTED, this);
        EventService.getInstance().unsubscribe(TableEvent.SCROLL_TO_AND_TOGGLE_ROW, this);
    }

    public async eventPublished(data: TableEventData, eventId: string, subscriberId?: string): Promise<void> {
        if (this.state.table && data && data.tableId === this.state.table.getTableId()) {
            if (eventId === TableEvent.REFRESH) {
                this.state.columns = this.state.table.getColumns();
                this.state.rows = this.state.table.getRows();

                await this.provideContextContent();
                this.setTableHeight();

                EventService.getInstance().publish(
                    TableEvent.TABLE_READY,
                    new TableEventData(this.state.table.getTableId())
                );
            }

            if (eventId === TableEvent.RERENDER_TABLE) {
                this.state.loading = true;

                this.state.columns = this.state.table.getColumns();
                this.state.rows = this.state.table.getRows();

                this.setTableHeight();

                setTimeout(() => {
                    this.state.loading = false;
                }, 50);
            }

            if (eventId === TableEvent.ROW_TOGGLED) {
                this.setTableHeight();
            }
        }

        if (eventId === TableEvent.SCROLL_TO_AND_TOGGLE_ROW) {
            if (data && data.tableId && data.tableId === this.state.table.getTableId() && data.rowId) {
                const row: IRow = this.state.table.getRow(data.rowId);
                if (row) {
                    row.expand(true);
                    EventService.getInstance().publish(TableEvent.REFRESH, this.state.table.getTableId());
                    let element: any = document.getElementById(row.getRowId());
                    if (element) {
                        if (element) {
                            let top = 0;
                            if (element.offsetParent) {
                                do {
                                    top += element.offsetTop;
                                    element = element.offsetParent;
                                } while (element !== null);
                            }

                            window.scroll(0, top);
                        }

                    }
                }
            }
        }

        if (eventId === TableEvent.SORTED) {
            if (data && data.tableId && data.tableId === this.state.table.getTableId()) {
                const container = (this as any).getEl(this.state.table.getTableId() + "table-container");
                if (container) {
                    container.scrollTop = 0;
                }
            }
        }
    }

    private async provideContextContent(): Promise<void> {
        if (this.state.table.getContextId()) {
            const context = await ContextService.getInstance().getContext(this.state.table.getContextId());
            if (context) {
                const objects = this.state.table.getRows()
                    .filter((r) => r.getRowObject() !== null && typeof r.getRowObject() !== 'undefined')
                    .map((r) => r.getRowObject().getObject());

                context.setFilteredObjectList(objects);
            }
        }
    }

    public setTableHeight(): void {
        this.state.tableHeight = 'unset';
        if (this.state.table) {
            const rows = this.state.table.getRows(false);

            const availableRowsCount = this.countRows(rows);

            const limit = this.state.table.getTableConfiguration().displayLimit
                ? this.state.table.getTableConfiguration().displayLimit
                : availableRowsCount;

            const minElements = availableRowsCount > limit ? limit : availableRowsCount;
            const rowCount = minElements === 0 ? 1 : minElements;

            const headerRowHeight = this.browserFontSize
                * Number(this.state.table.getTableConfiguration().headerHeight);
            const rowHeight = this.browserFontSize * Number(this.state.table.getTableConfiguration().rowHeight);

            let height = ((rowCount * rowHeight) + headerRowHeight)
                + (this.hScrollWillBeVisible() ? rowHeight : rowHeight / 2);

            rows.forEach((r) => {
                if (r.isExpanded()) {
                    height += (31.5 + 10) / 2 * this.browserFontSize;
                }
            });

            this.state.tableHeight = height + 'px';
        }
    }

    private countRows(rows: IRow[]): number {
        let count = rows.length;
        rows.forEach((r) => count += this.countRows(r.getChildren()));
        return count;
    }

    private hScrollWillBeVisible(): boolean {
        let withScroll = false;
        const root = (this as any).getEl();
        if (root) {
            let columnWidth = 0;
            const columns = this.state.table.getColumns();
            columns.forEach((c) => columnWidth += this.getColumnSize(c));
            if (this.state.table.getTableConfiguration().enableSelection) {
                columnWidth += 2.5 * this.browserFontSize;
            }
            if (this.state.table.getTableConfiguration().toggle) {
                columnWidth += 2.5 * this.browserFontSize;
            }

            withScroll = root.getBoundingClientRect().width < columnWidth;
        }
        return withScroll;
    }

    private getColumnSize(column: IColumn): number {
        let minWidth: number = (2.5 * this.browserFontSize);
        const config = column.getColumnConfiguration();
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
        return config.size < minWidth ? minWidth : config.size;
    }

    public onScroll(): void {
        // load rows
    }
}

module.exports = Component;
