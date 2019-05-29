import { ITable } from "./ITable";
import { LabelService } from "../LabelService";

export class TableExportUtil {

    public static async export(table: ITable, additionalColumns: string[] = []): Promise<void> {
        const csvString = await this.prepareCSVString(table, additionalColumns);
        this.downloadCSVFile(csvString);
    }

    private static async prepareCSVString(table: ITable, additionalColumns: string[]): Promise<string> {
        const objectType = table.getObjectType();
        const columns = await table.getColumns();
        const columnTitles: string[] = [];

        const columnIds = [...columns.map((c) => c.getColumnId()), ...additionalColumns];

        for (const c of columnIds) {
            let value = c;
            if (objectType) {
                value = await LabelService.getInstance().getPropertyText(value, objectType);
            }
            columnTitles.push(`"${this.escapeText(value.trim())}"`);
        }

        let csvString = columnTitles.join(';') + "\n";

        const selectedRows = table.getSelectedRows();

        for (const row of selectedRows) {
            const values: string[] = [];
            for (const cId of columnIds) {
                let displayValue = '';
                const cell = row.getCell(cId);
                if (cell) {
                    displayValue = await cell.getDisplayValue();
                } else {
                    displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                        row.getRowObject().getObject(), cId, undefined
                    );
                }
                values.push(`"${this.escapeText(displayValue)}"`);
            }
            csvString += values.join(';') + "\n";
        }
        return csvString;
    }

    private static downloadCSVFile(csvString: string): void {
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

    private static escapeText(text: string): string {
        text = text.replace(/\"/g, '\\"');
        return text;
    }

}
