declare var PerfectScrollbar: any;
import { StandardTableComponentState } from './StandardTableComponentState';
import { StandardTableInput } from './StandardTableInput';
import { StandardTableConfiguration, StandardTableColumn } from '@kix/core/dist/browser';

class StandardTableComponent<T> {

    private state: StandardTableComponentState;

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
            const psY = new PerfectScrollbar('.standard-table', {
                minScrollbarLength: 50,
                wrapperElement: '.standard-table-wrapper'
            });
        }

        /*
         * Code für fixed Header und fixed Column inkl horiz. und vertik. Scrollbar
            var tableWrapper = document.getElementsByClassName('standard-table-wrapper');
            var table        = document.getElementsByClassName('standard-table');
            var header       = document.getElementsByClassName('header-row');
            var fixedLeft    = document.getElementsByClassName('table-cell fixed fixed-left');
            var fixedRight   = document.getElementsByClassName('table-cell fixed fixed-right');
            var scrollbar    = document.getElementsByClassName('table-cell fixed fixed-right scrollbar-column');
            var subRow       = document.getElementsByClassName('sub-row-wrapper visible');
            // Header fixieren
            table[0].addEventListener('ps-scroll-y', function() {
                for (var x=0; x<header.length; x++) {
                    header[x].style.top = table[0].scrollTop + 'px';
                }
            });
            // linke, rechte Spalte und geöffnete Zeile fixieren
            table[0].addEventListener('ps-scroll-x', function() {
                for (var x=0; x<fixedLeft.length; x++) {
                    fixedLeft[x].style.left = table[0].scrollLeft + 'px';
                }
                for (var x=0; x<fixedRight.length; x++) {
                    fixedRight[x].style.right = ((table[0].scrollLeft + 24) * -1) + 'px';
                }
                for (var x=0; x<scrollbar.length; x++) {
                    // 24 == 2em == Breite der Scrollbarspalte
                    scrollbar[x].style.right = (table[0].scrollLeft * -1) + 'px';
                }
                for (var x=0; x<subRow.length; x++) {
                    subRow[x].style.left = table[0].scrollLeft + 'px';
                }
            });
        */

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
        this.state.resizeSettings.resizeColumn = col;
        this.state.resizeSettings.startOffset = event.target.offsetWidth - event.pageX;
    }

    private mousemove(event: any): void {
        if (this.state.resizeSettings.resizeColumn) {
            const selector = "[data-id='" + this.state.resizeSettings.resizeColumn + "']";
            const elements: any = document.querySelectorAll(selector);
            elements.forEach((element: any) => {
                element.style.width = this.state.resizeSettings.startOffset + 150 + event.pageX + 'px';
            });
        }
    }

    private mouseup(): void {
        this.state.resizeSettings.resizeColumn = undefined;
    }


}

module.exports = StandardTableComponent;
