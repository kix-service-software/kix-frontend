declare var PerfectScrollbar: any;
import { StandardTableComponentState } from './StandardTableComponentState';
import { StandardTableInput } from './StandardTableInput';
import { StandardTableConfiguration, StandardTableColumn } from '@kix/core/dist/browser';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

class StandardTableComponent<T> {

    private state: StandardTableComponentState;
    private loadMoreTimeout: any = null;
    private ps: any;

    public onCreate(input: StandardTableInput): void {
        this.state = new StandardTableComponentState();
    }

    public onInput(input: StandardTableInput): void {
        this.state.tableConfiguration = input.tableConfiguration;
    }

    public onMount(): void {
        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));
        if (this.state.tableConfiguration) {
            this.state.tableConfiguration.contentProvider.addListener(() => {
                (this as any).forceUpdate();
            });
            this.ps = new PerfectScrollbar('.standard-table', {
                minScrollbarLength: 50,
                wrapperElement: '.standard-table-wrapper'
            });
        }

        this.initTableScrollRange();
    }

    private initTableScrollRange(): void {
        setTimeout(() => {
            const table = (this as any).getEl(this.state.tableId + 'standard-table');
            const header = (this as any).getEl(this.state.tableId + 'header-row');
            const checkboxColumn: any =
                document.querySelectorAll("[data-id='" + this.state.tableId + "checkbox-column']");
            const toggleRowColumn: any =
                document.querySelectorAll("[data-id='" + this.state.tableId + "toggle-row-column']");
            const scrollbarColumn: any =
                document.querySelectorAll("[data-id='" + this.state.tableId + "scrollbar-column']");

            // TODO: subRows erneut implementieren!
            // const subRows: any = document.querySelectorAll("[data-id='sub-row-wrapper']");

            if (table) {
                table.addEventListener('ps-scroll-y', () => {
                    header.style.top = table.scrollTop + 'px';
                });

                // linke, rechte Spalte und geöffnete Zeile fixieren
                table.addEventListener('ps-scroll-x', () => {
                    const scrollbarColumnPos = (table.scrollLeft * -1);
                    checkboxColumn.forEach((element: any) => {
                        element.style.left = table.scrollLeft + 'px';
                    });
                    toggleRowColumn.forEach((element: any) => {
                        element.style.right = (scrollbarColumnPos + 24) + 'px';
                    });
                    scrollbarColumn.forEach((element: any) => {
                        element.style.right = scrollbarColumnPos + 'px';
                    });

                    // TODO: subRows erneut implementieren!
                    // subRows.forEach((element: any) => {
                    //     element.style.left = table.scrollLeft + 'px';
                    // });
                });

                this.ps.update();
            }
        }, 250);
    }

    public onUpdate(): void {
        this.initTableScrollRange();
    }

    private getRows(): T[] {
        return this.state.tableConfiguration
            ? this.state.tableConfiguration.contentProvider.getRowObjects()
            : [];
    }

    private getColumnIds(): string[] {
        return this.state.tableConfiguration ? this.state.tableConfiguration.contentProvider.getColumnIds() : [];
    }

    private getColumnConfiguration(columnId: string): StandardTableColumn {
        return this.state.tableConfiguration.contentProvider.getColumn(columnId);
    }

    private getColumnTitle(columnId: string): string {
        return this.state.tableConfiguration
            ? this.state.tableConfiguration.labelProvider.getColumnTitle(columnId)
            : columnId;
    }

    private getColumnObjectValue(object: any, columnId: string): number | string {
        return this.state.tableConfiguration.labelProvider.getColumnObjectValue(object, columnId);
    }

    private getColumnDisplayText(rowObject: T, columnId: string): string {
        return this.state.tableConfiguration
            ? this.state.tableConfiguration.labelProvider.getColumnValue(rowObject, columnId)
            : columnId;
    }

    private mousedown(col: string, event: any): void {
        this.state.resizeSettings.columnId = col;
        this.state.resizeSettings.startOffset = event.target.offsetWidth - event.pageX;
    }

    private mousemove(event: any): void {
        if (this.state.resizeSettings.columnId) {
            const selector = "[data-id='" + this.state.tableId + this.state.resizeSettings.columnId + "']";
            const elements: any = document.querySelectorAll(selector);
            elements.forEach((element: any) => {
                this.state.resizeSettings.currentSize = this.state.resizeSettings.startOffset + 150 + event.pageX;
                element.style.width = this.state.resizeSettings.currentSize + 'px';
            });
        }
    }

    private mouseup(): void {
        if (this.state.tableConfiguration && this.state.resizeSettings) {
            const columnConfig = this.getColumnConfiguration(this.state.resizeSettings.columnId);
            if (columnConfig) {
                columnConfig.size = this.state.resizeSettings.currentSize;

                if (this.state.tableConfiguration.configurationListener) {
                    this.state.tableConfiguration.configurationListener.columnConfigurationChanged(columnConfig);
                }
            }
        }
        this.state.resizeSettings.columnId = undefined;
    }

    private sortUp(columnId: string): void {
        this.state.tableConfiguration.contentProvider.sortObjects(SortOrder.UP, columnId);
        this.state.sortedColumnId = columnId;
        this.state.sortOrder = SortOrder.UP;
    }

    private sortDown(columnId: string): void {
        this.state.tableConfiguration.contentProvider.sortObjects(SortOrder.DOWN, columnId);
        this.state.sortedColumnId = columnId;
        this.state.sortOrder = SortOrder.DOWN;
    }

    private isActiveSort(columnId: string, sortOrder: SortOrder): boolean {
        return this.state.sortedColumnId === columnId && this.state.sortOrder === sortOrder;
    }

    private selectAll(event): void {
        const checked = event.target.checked;

        const elements: any = document.querySelectorAll("[data-id='" + this.state.tableId + "checkbox-input'");
        elements.forEach((element: any) => {
            element.checked = checked;
        });

        if (this.state.tableConfiguration.selectionListener) {
            if (checked) {
                this.state.tableConfiguration.selectionListener.selectNone();
            } else {
                this.state.tableConfiguration.selectionListener.selectAll();
            }
        }
    }

    private selectRow(row: any, event: any): void {
        if (this.state.tableConfiguration.selectionListener) {
            this.state.tableConfiguration.selectionListener.selectionChanged(row, event.target.checked);
        }
    }

    private rowClicked(row: any, columnId: string): void {
        if (this.state.tableConfiguration.clickListener) {
            this.state.tableConfiguration.clickListener.rowClicked(row, columnId);
        }
    }

    private loadMore(): void {
        const standardTable = (this as any).getEl(this.state.tableId + 'standard-table');
        if (standardTable && standardTable.scrollTop > 0 && !this.loadMoreTimeout) {
            const checkHeight =
                this.state.tableConfiguration.contentProvider.getCurrentDisplayLimit()
                * this.state.tableConfiguration.rowHeight;
            if (standardTable.scrollTop > checkHeight) {
                this.state.tableConfiguration.contentProvider.increaseCurrentDisplayLimit();

                // check after increase if still more have to be loaded
                this.loadMoreTimeout = setTimeout(() => {
                    this.loadMoreTimeout = null;
                    this.loadMore();
                }, 66);
            }
        }
    }

    public getRowHeight(): string {
        return this.state.tableConfiguration.rowHeight + 'px';
    }

    public getTableHeight(): string {
        const minElements =
            this.getRows().length > this.state.tableConfiguration.contentProvider.getDisplayLimit() ?
                this.state.tableConfiguration.contentProvider.getDisplayLimit() : this.getRows().length;
        const height = (minElements + 1) * this.state.tableConfiguration.rowHeight;
        return height + 'px';
    }

    public getSpacerHeight(): string {
        let spacerHeight = 0;
        const remainder =
            this.state.tableConfiguration.contentProvider.getLimit()
            - this.state.tableConfiguration.contentProvider.getCurrentDisplayLimit()
            - Math.ceil(this.state.tableConfiguration.contentProvider.getDisplayLimit() * 1.5);
        if (remainder > 0) {
            spacerHeight = remainder * this.state.tableConfiguration.rowHeight;
        }
        return spacerHeight + 'px';
    }

    private hasClickListener(): boolean {
        return this.state.tableConfiguration.clickListener !== undefined;
    }

    private getColumnSize(columnId: string): string {
        return this.getColumnConfiguration(columnId).size + 'px';
    }
}

module.exports = StandardTableComponent;
