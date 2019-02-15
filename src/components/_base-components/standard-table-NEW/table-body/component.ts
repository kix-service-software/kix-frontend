import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../core/browser';
import { TableConfiguration } from '../../../../core/browser/table';

class Component extends AbstractMarkoComponent<ComponentState> {

    public columnLength: number = 0;
    public selectionEnabled: boolean;
    public toggleEnabled: boolean;

    private tableConfig: TableConfiguration;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.rows = input.rows;
        this.columnLength = input.columnLength ? input.columnLength : 0;
        this.tableConfig = input.tableConfig;
        this.selectionEnabled = this.tableConfig ? this.tableConfig.enableSelection : null;
        this.toggleEnabled = this.tableConfig ? this.tableConfig.toggle : null;
    }

    public async onMount(): Promise<void> {
        //
    }

    public onDestroy(): void {
        // nothing
    }

    public getFullColumnLength(): number {
        let columnLength = this.columnLength + 1;
        if (this.selectionEnabled) {
            columnLength++;
        }
        if (this.toggleEnabled) {
            columnLength++;
        }
        return columnLength;
    }

    public getPlaceholderCount(): number {
        // TODO: alle Zeilen - anzuzeigende Zeilen = Platzhalterzeilen
        return 0;
    }

    public getEmptyString(): string {
        return this.tableConfig ? this.tableConfig.emptyResultHint : 'Keine Elemente vorhanden.';
    }

    public getRowHeight(): string {
        return (this.tableConfig ? this.tableConfig.rowHeight : 1.75) + 'rem';
    }

    // TODO: ggf. entfernen
    public loadMore(scrollTop: number): void {
        // if (scrollTop > 0 && this.currLoadLimit < this.state.table.getLimit()) {
        //     // FIXME: StandardTable anpassen
        //     const checkHeight =
        //         // (this.currDisplayLimit - this.state.standardTable.getMinRowsLoadLimit())
        //         (this.currLoadLimit - Math.floor(this.initialLoadLimit * .25))
        //         * this.state.table.tableConfiguration.rowHeight
        //         * this.getBrowserFontsize();
        //     const neededHeight = scrollTop
        //         + (this.displayLimit
        //             * this.state.table.tableConfiguration.rowHeight
        //             * this.getBrowserFontsize());
        //     if (neededHeight > checkHeight) {
        //         this.appendRows(
        //             Math.ceil(
        //                 (neededHeight - checkHeight)
        //                 / (this.state.table.tableConfiguration.rowHeight * this.getBrowserFontsize())
        //             )
        //         );
        //     }
        // }
    }

    // public async appendRows(neededRows: number = 0): Promise<void> {
    //     if (neededRows >= 0) {
    //         const tableRow = require('../table-row');
    //         const toggleRow = require('../table-toggle-row');
    //         if (tableRow) {
    //             const tableBody = (this as any).getEl();

    //             if (tableBody) {
    //                 const spacerRows = tableBody.getElementsByClassName('spacer-rows');
    //                 const oldLoadLimit = this.currLoadLimit;
    //                 this.currLoadLimit += neededRows + this.initialLoadLimit;
    //                 const newRows = this.state.table.getTableRows(true).slice(
    //                     oldLoadLimit, this.currLoadLimit
    //                 );
    //                 for (const row of newRows) {
    //                     await this.addRow(row, tableBody, spacerRows, tableRow, toggleRow);
    //                 }
    //             }
    //         }
    //     }
    // }

    // private async addRow(row, tableBody, spacerRows, tableRow, toggleRow): Promise<void> {
    //     const result = await tableRow.render({
    //         isCheckable: this.isCheckable,
    //         isToggleable: this.isToggleable,
    //         row,
    //         columns: this.columns,
    //         height: this.getRowHeight()
    //     });

    //     if (spacerRows && !!spacerRows.length) {
    //         result.replace(spacerRows[0]);
    //     } else {
    //         result.appentTo(tableBody);
    //     }
    // }
}

module.exports = Component;
