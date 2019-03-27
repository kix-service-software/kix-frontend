import { AbstractAction } from '../../model/components/action/AbstractAction';
import { LabelService } from '../LabelService';
import { ITable } from '../table';

export class CSVExportAction extends AbstractAction<ITable> {

    public initAction(): void {
        this.text = "CSV-Export";
        this.icon = "kix-icon-export";
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            const selectedRows = this.data.getSelectedRows();
            canRun = selectedRows && !!selectedRows.length;
        }
        return canRun;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            const objectType = this.data.getObjectType();
            const columns = await this.data.getColumns();
            const columnTitles: string[] = [];
            for (const c of columns) {
                let value = c.getColumnId();
                if (objectType) {
                    value = await LabelService.getInstance().getPropertyText(value, objectType);
                }
                columnTitles.push(`"${this.escapeText(value.trim())}"`);
            }
            let csvString = columnTitles.join(';') + "\n";

            const selectedRows = this.data.getSelectedRows();

            for (const row of selectedRows) {
                const values: string[] = [];
                for (const column of columns) {
                    const cell = row.getCell(column.getColumnId());
                    let displayValue = '';
                    if (cell) {
                        displayValue = await cell.getDisplayValue();
                    }
                    values.push(`"${this.escapeText(displayValue)}"`);
                }
                csvString += values.join(';') + "\n";
            }

            if (window.navigator.msSaveOrOpenBlob) {
                const blob = new Blob([csvString]);
                window.navigator.msSaveBlob(blob, "Export.csv");
            } else {
                const element = document.createElement('a');
                element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString);
                element.download = 'Export.csv';
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        }
    }

    private escapeText(text: string): string {
        text = text.replace(/\"/g, '\\"');
        return text;
    }

}
