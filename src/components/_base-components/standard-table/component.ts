declare var PerfectScrollbar: any;
import { StandardTableComponentState } from './StandardTableComponentState';
import { StandardTableInput } from './StandardTableInput';
import { StandardTable, TableColumnConfiguration, TableRow, TableColumn } from '@kix/core/dist/browser';
import { SortOrder } from '@kix/core/dist/model';

class StandardTableComponent<T> {

    private state: StandardTableComponentState;
    private loadMoreTimeout: any = null;
    private ps: any;

    public onCreate(input: StandardTableInput): void {
        this.state = new StandardTableComponentState();
    }

    public onInput(input: StandardTableInput): void {
        this.state.standardTable = input.standardTable;
    }

    public onMount(): void {
        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));
        if (this.state.standardTable) {
            const table = (this as any).getEl(this.state.tableId + 'standard-table');
            const wrapperElement = (this as any).getEl(this.state.tableId + 'standard-table-wrapper');
            this.ps = new PerfectScrollbar(table, {
                minScrollbarLength: 50,
                wrapperElement
            });

            this.state.standardTable.setTableListener(() => {
                (this as any).forceUpdate();
            });
        }

        this.initTableScrollRange();
    }

    private initTableScrollRange(): void {
        const table = (this as any).getEl(this.state.tableId + 'standard-table');

        if (table) {

            table.addEventListener('ps-scroll-y', () => {
                const header = (this as any).getEl(this.state.tableId + 'header-row');
                header.style.top = table.scrollTop + 'px';
            });

            table.addEventListener('ps-scroll-x', () => {
                const scrollbarColumnPos = (table.scrollLeft * -1);

                const toggleRowColumns: any =
                    document.querySelectorAll("[data-id='" + this.state.tableId + "toggle-row-column']");
                toggleRowColumns.forEach((cell: any) => {
                    cell.style.right = scrollbarColumnPos + 'px';
                });

                const openedRows: any =
                    document.querySelectorAll("[data-id='" + this.state.tableId + "opened-row-content-wrapper']");
                openedRows.forEach((cell: any) => {
                    cell.style.left = table.scrollLeft + 'px';
                });
            });

            this.ps.update();
        }
    }

    public onUpdate(): void {
        const table = (this as any).getEl(this.state.tableId + 'standard-table');
        const header = (this as any).getEl(this.state.tableId + 'header-row');
        if (table && header) {
            header.style.top = table.scrollTop + 'px';
            // FIXME: hat hier nix zu suchen, aber ohne geht "loadMore" nicht mehr, warum auch immer...
            table.addEventListener('ps-scroll-y', () => {
                header.style.top = table.scrollTop + 'px';
            });
        }
        this.ps.update();
    }

    private getRows(): Array<TableRow<T>> {
        return this.state.standardTable
            ? this.state.standardTable.getRows()
            : [];
    }

    private getColumns(): TableColumn[] {
        return this.state.standardTable ? this.state.standardTable.getColumns() : [];
    }

    private mousedown(col: string, event: any): void {
        this.state.resizeSettings.columnId = col;
        this.state.resizeSettings.startOffset = event.pageX;
        this.state.resizeActive = true;
    }

    private mousemove(event: any): void {
        if (this.state.resizeSettings.columnId) {
            const headerColumn = (this as any).getEl(this.state.tableId + this.state.resizeSettings.columnId);
            this.state.resizeSettings.currentSize
                = headerColumn.offsetWidth + event.pageX - this.state.resizeSettings.startOffset;
            this.state.resizeSettings.startOffset = event.pageX;
            headerColumn.style.width = this.state.resizeSettings.currentSize + 'px';

            const selector = "[data-id='" + this.state.tableId + this.state.resizeSettings.columnId + "']";
            const elements: any = document.querySelectorAll(selector);
            elements.forEach((element: any) => {
                element.style.width = this.state.resizeSettings.currentSize + 'px';
            });
        }
    }

    private mouseup(): void {
        if (this.state.standardTable && this.state.resizeSettings) {
            const column = this.getColumns().find((col) => col.id === this.state.resizeSettings.columnId);
            if (column) {
                column.size = this.state.resizeSettings.currentSize;
                if (this.state.standardTable.configurationChangeListener) {
                    this.state.standardTable.configurationChangeListener.columnConfigurationChanged(column);
                }
            }
        }
        this.state.resizeSettings.columnId = undefined;
        this.state.resizeActive = false;
    }

    private sortUp(columnId: string): void {
        if (this.state.sortedColumnId !== columnId || this.state.sortOrder !== SortOrder.UP) {
            this.state.standardTable.setSortSettings(columnId, SortOrder.UP);
            this.state.sortedColumnId = columnId;
            this.state.sortOrder = SortOrder.UP;
            this.scrollTableToTop();
        }
    }

    private sortDown(columnId: string): void {
        if (this.state.sortedColumnId !== columnId || this.state.sortOrder !== SortOrder.DOWN) {
            this.state.standardTable.setSortSettings(columnId, SortOrder.DOWN);
            this.state.sortedColumnId = columnId;
            this.state.sortOrder = SortOrder.DOWN;
            this.scrollTableToTop();
        }
    }

    private scrollTableToTop(): void {
        const table = (this as any).getEl(this.state.tableId + 'standard-table');
        table.scrollTop = 0;
    }

    private isActiveSort(columnId: string, sortOrder: SortOrder): boolean {
        return this.state.sortedColumnId === columnId && this.state.sortOrder === sortOrder;
    }

    private isSelected(row): boolean {
        return this.state.standardTable.selectionListener ?
            this.state.standardTable.selectionListener.isRowSelected(row) : false;
    }

    private isAllSelected(row): boolean {
        return this.state.standardTable.selectionListener ?
            this.state.standardTable.selectionListener.isAllSelected() : false;
    }

    private selectAll(event): void {
        const checked = event.target.checked;

        const elements: any = document.querySelectorAll("[data-id='" + this.state.tableId + "checkbox-input'");
        elements.forEach((element: any) => {
            element.checked = checked;
        });

        if (this.state.standardTable.selectionListener) {
            if (checked) {
                this.state.standardTable.selectionListener.selectAll(
                    this.state.standardTable.getRows()
                );
            } else {
                this.state.standardTable.selectionListener.selectNone();
            }
        }
    }

    private selectRow(row: any, event: any): void {
        if (this.state.standardTable.selectionListener) {
            this.state.standardTable.selectionListener.selectionChanged(row, event.target.checked);
        }
    }

    private rowClicked(row: TableRow<T>, columnId: string): void {
        if (this.state.standardTable.clickListener) {
            this.state.standardTable.clickListener.rowClicked(row.object, columnId);
        }
    }

    private loadMore(): void {
        const standardTable = (this as any).getEl(this.state.tableId + 'standard-table');
        if (standardTable && standardTable.scrollTop > 0 && !this.loadMoreTimeout) {
            const checkHeight =
                this.state.standardTable.getCurrentDisplayLimit()
                * this.state.standardTable.rowHeight;
            if (standardTable.scrollTop > checkHeight) {
                this.state.standardTable.increaseCurrentDisplayLimit();

                // check after increase if still more have to be loaded
                this.loadMoreTimeout = setTimeout(() => {
                    this.loadMoreTimeout = null;
                    this.loadMore();
                }, 66);

                (this as any).setStateDirty();
            }
        }
    }

    public getRowHeight(): string {
        return this.state.standardTable.rowHeight + 'px';
    }

    public getTableHeight(): string {
        const minElements =
            this.getRows().length > this.state.standardTable.displayLimit ?
                this.state.standardTable.displayLimit : this.getRows().length;
        const height = (minElements + 1) * this.state.standardTable.rowHeight;
        return height + 'px';
    }

    public getSpacerHeight(): string {
        let spacerHeight = 0;
        const remainder =
            this.state.standardTable.limit
            - this.state.standardTable.displayLimit
            - Math.ceil(this.state.standardTable.displayLimit * 1.5);
        if (remainder > 0) {
            spacerHeight = remainder * this.state.standardTable.rowHeight;
        }
        return spacerHeight + 'px';
    }

    private getColumnSize(columnId: string): string {
        const column = this.getColumns().find((col) => col.id === columnId);
        return column.size + 'px';
    }

    private toggleRow(rowId: number): void {
        const rowIndex = this.state.toggledRows.findIndex((r) => r === rowId);
        if (rowIndex === -1) {
            this.state.toggledRows.push(rowId);
        } else {
            this.state.toggledRows.splice(rowIndex, 1);
        }

        (this as any).forceUpdate();

        setTimeout(() => {
            const table = (this as any).getEl(this.state.tableId + 'standard-table');
            if (table) {
                const openedRows: any =
                    document.querySelectorAll("[data-id='" + this.state.tableId + "opened-row-content-wrapper']");
                openedRows.forEach((cell: any) => {
                    cell.style.left = table.scrollLeft + 'px';
                });
            }
        }, 50);
    }

    private rowIsToggled(rowId): boolean {
        return this.state.toggledRows.findIndex((r) => r === rowId) !== -1;
    }
}

module.exports = StandardTableComponent;
