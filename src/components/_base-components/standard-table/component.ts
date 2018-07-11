declare var PerfectScrollbar: any;
import { StandardTableComponentState } from './StandardTableComponentState';
import { StandardTableInput } from './StandardTableInput';
import { TableRow, TableColumn, TableValue, ActionFactory } from '@kix/core/dist/browser';
import { SortOrder, KIXObject, Article, IAction, ObjectIcon } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';

class StandardTableComponent<T extends KIXObject<T>> {

    private state: StandardTableComponentState<T>;
    private loadMoreTimeout: any = null;
    private ps: any;

    public onCreate(input: StandardTableInput<T>): void {
        this.state = new StandardTableComponentState<T>();
    }

    public onInput(input: StandardTableInput<T>): void {
        this.state.standardTable = input.standardTable;
        if (this.state.standardTable) {
            this.state.tableId = this.state.standardTable.tableId;
        }
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

            this.state.standardTable.setTableListener((scrollToTop: boolean = true) => {
                (this as any).setStateDirty();
                if (scrollToTop) {
                    this.scrollTableToTop();
                }
            });
        }

        setTimeout(() => {
            this.setRowWidth();
            this.setTableHeight();
            this.initTableScrollRange();
        }, 500);
    }

    public onDestroy(): void {
        document.removeEventListener('mousemove', this.mousemove.bind(this));
        document.removeEventListener('mouseup', this.mouseup.bind(this));
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

                const openedRows = (this as any).getEls(this.state.tableId + "row-toggle-content-wrapper");
                openedRows.forEach((cell: any) => {
                    cell.style.left = table.scrollLeft + 'px';
                });
            });

            this.ps.update();
        }
    }

    private setRowWidth(): void {
        const headerRow = (this as any).getEl(this.state.tableId + 'header-row');
        if (headerRow) {
            let rowWidth = 0;
            this.state.standardTable.getColumns().forEach((c) => rowWidth += c.size);
            if (this.state.standardTable.tableConfiguration.enableSelection) {
                rowWidth += headerRow.firstChild.offsetWidth;
            }
            this.state.rowWidth = rowWidth;
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
        this.setTableHeight();
        this.ps.update();
    }

    private getColumns(): TableColumn[] {
        return this.state.standardTable ? this.state.standardTable.getColumns() : [];
    }

    public mousedown(col: string, event: any): void {
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

            const elements: any = (this as any).getEls(
                this.state.tableId.toString() + this.state.resizeSettings.columnId
            );
            elements.forEach((element: any) => {
                element.style.width = this.state.resizeSettings.currentSize + 'px';
            });
        }
    }

    private mouseup(): void {
        if (this.state.standardTable && this.state.resizeSettings.columnId) {
            const column = this.getColumns().find((col) => col.id === this.state.resizeSettings.columnId);
            if (column) {
                column.size = this.state.resizeSettings.currentSize;
                if (this.state.standardTable.listenerConfiguration.configurationChangeListener) {
                    this.state.standardTable.listenerConfiguration.configurationChangeListener
                        .columnConfigurationChanged(column);
                }
            }
        }
        this.state.resizeSettings.columnId = undefined;
        this.state.resizeActive = false;
        this.setRowWidth();
    }

    public sortUp(columnId: string): void {
        if (this.state.sortedColumnId !== columnId || this.state.sortOrder !== SortOrder.UP) {
            this.state.standardTable.setSortSettings(columnId, SortOrder.UP);
            this.state.sortedColumnId = columnId;
            this.state.sortOrder = SortOrder.UP;
            this.scrollTableToTop();
        }
    }

    public sortDown(columnId: string): void {
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

    public isActiveSort(columnId: string, sortOrder: SortOrder): boolean {
        return this.state.sortedColumnId === columnId && this.state.sortOrder === sortOrder;
    }

    public isSelected(row: TableRow<T>): boolean {
        return this.state.standardTable.listenerConfiguration.selectionListener ?
            this.state.standardTable.listenerConfiguration.selectionListener.isRowSelected(row) : false;
    }

    public isAllSelected(): boolean {
        return this.state.standardTable.listenerConfiguration.selectionListener ?
            this.state.standardTable.listenerConfiguration.selectionListener.isAllSelected() : false;
    }

    public selectAll(event): void {
        const checked = event.target.checked;

        const elements: any = document.querySelectorAll("[data-id='" + this.state.tableId + "checkbox-input'");
        elements.forEach((element: any) => {
            element.checked = checked;
        });

        if (this.state.standardTable.listenerConfiguration.selectionListener) {
            if (checked) {
                this.state.standardTable.listenerConfiguration.selectionListener.selectAll(
                    this.state.standardTable.getTableRows(true)
                );
            } else {
                this.state.standardTable.listenerConfiguration.selectionListener.selectNone();
            }
        }
    }

    public selectRow(row: any, event: any): void {
        if (this.state.standardTable.listenerConfiguration.selectionListener) {
            this.state.standardTable.listenerConfiguration.selectionListener
                .selectionChanged(row, event.target.checked);
        }
    }

    public rowClicked(row: TableRow<T>, columnId: string, event: any): void {
        if (this.state.standardTable.listenerConfiguration.clickListener) {
            this.state.standardTable.listenerConfiguration.clickListener.rowClicked(row.object, columnId, event);
        }
    }

    public loadMore(): void {
        const standardTable = (this as any).getEl(this.state.tableId + 'standard-table');
        if (standardTable && standardTable.scrollTop > 0 && !this.loadMoreTimeout) {
            const checkHeight =
                this.state.standardTable.getCurrentDisplayLimit()
                * this.state.standardTable.tableConfiguration.rowHeight;
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

    public setTableHeight(): void {
        const table = (this as any).getEl(this.state.tableId + 'standard-table');
        if (table) {
            table.style.height = 'unset';
            if (!this.state.standardTable.isLoading()) {
                const rows = this.state.standardTable.getTableRows();
                const minElements = rows.length > this.state.standardTable.tableConfiguration.displayLimit ?
                    this.state.standardTable.tableConfiguration.displayLimit : rows.length;
                const rowCount = minElements === 0 ? 1 : minElements;

                const browserFontSizeSetting = window
                    .getComputedStyle(document.getElementsByTagName("body")[0], null)
                    .getPropertyValue("font-size");

                const browserFontSize = Number(browserFontSizeSetting.replace('px', ''));

                const headerRowHeight =
                    browserFontSize * Number(this.state.standardTable.tableConfiguration.headerHeight);
                const rowHeight = browserFontSize * Number(this.state.standardTable.tableConfiguration.rowHeight);

                let height = (rowCount * rowHeight) + headerRowHeight;
                const openedRowsContent = (this as any).getEls(this.state.tableId + "row-toggle-content-wrapper");
                openedRowsContent.forEach((rC) => {
                    height += rC.offsetHeight;
                });
                table.style.height = height + 'px';
            }
        }
    }

    public getRowHeight(): string {
        return this.state.standardTable.tableConfiguration.rowHeight + 'em';
    }

    public getHeaderHeight(): string {
        return this.state.standardTable.tableConfiguration.headerHeight + 'em';
    }

    public getSpacerHeight(): string {
        let spacerHeight = 0;
        const remainder =
            this.state.standardTable.getLimit()
            - this.state.standardTable.getCurrentDisplayLimit()
            - Math.ceil(this.state.standardTable.tableConfiguration.displayLimit * 1.5);
        if (remainder > 0) {
            spacerHeight = remainder * this.state.standardTable.tableConfiguration.rowHeight;
        }
        return spacerHeight + 'em';
    }

    public getColumnSize(columnId: string): string {
        const column = this.getColumns().find((col) => col.id === columnId);
        return column.size + 'px';
    }

    public async toggleRow(row: TableRow<T>): Promise<void> {
        this.state.standardTable.toggleRow(row);

        (this as any).forceUpdate();

        setTimeout(() => {
            const table = (this as any).getEl(this.state.tableId + 'standard-table');
            if (table) {
                const openedRows = (this as any).getEls(this.state.tableId + "row-toggle-content-wrapper");
                openedRows.forEach((cell: any) => cell.style.left = table.scrollLeft + 'px');
            }
        }, 50);
    }

    public getToggleTemplate(): any {
        return this.state.standardTable.tableConfiguration.toggleOptions.componentId ?
            ComponentsService.getInstance().getComponentTemplate(
                this.state.standardTable.tableConfiguration.toggleOptions.componentId
            ) : undefined;
    }

    public getToggleInput(row: TableRow<T>): any {
        const toggleInput = {};
        if (this.state.standardTable.tableConfiguration.toggleOptions.inputPropertyName) {
            toggleInput[this.state.standardTable.tableConfiguration.toggleOptions.inputPropertyName] = row.object;
        }
        return toggleInput;
    }

    public getToggleActions(article: Article): IAction[] {
        let actions = [];
        if (this.state.standardTable.isToggleEnabled()) {
            actions = ActionFactory.getInstance().generateActions(
                this.state.standardTable.tableConfiguration.toggleOptions.actions, false, [article]
            );
        }
        return actions;
    }

    public getColumn(value: TableValue): TableColumn {
        const column = this.state.standardTable.getColumns().find((c) => c.id === value.columnId);
        return column;
    }

    public calculateToggleContentMinHeight(index: number): string {
        const minHeight = "10em";
        setTimeout(() => {
            if (this.state.standardTable.tableConfiguration.toggleOptions.actions.length > 5) {
                const actionList = document.querySelector('ul.toggle-actions');
                const computedHeight = getComputedStyle(actionList).height;
                const rowContent = (this as any).getEl(this.state.tableId + "row-toggle-content-" + index);

                rowContent.style.minHeight = computedHeight;
            }
            this.setTableHeight();
            this.ps.update();
        }, 10);

        return minHeight;
    }

    public getColumnIcon(column: TableColumn): ObjectIcon {
        return new ObjectIcon(column.icon[0], column.icon[1]);
    }

    public getValueIcon(column: TableColumn, value: TableValue): ObjectIcon {
        return new ObjectIcon(column.id, value.objectValue);
    }

    public getRowClasses(row: TableRow<T>): string[] {
        const classes = [...row.classes];
        if (!row.selectable) {
            classes.push('row-not-selectable');
        }
        return classes;
    }
}

module.exports = StandardTableComponent;
