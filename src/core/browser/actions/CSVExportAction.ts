import { AbstractAction } from '../../model/components/action/AbstractAction';
import { LabelService } from '../LabelService';
import { StandardTable } from '../standard-table';

export class CSVExportAction extends AbstractAction<StandardTable> {

    public initAction(): void {
        this.text = "CSV-Export";
        this.icon = "kix-icon-export";
    }

    public canRun(): boolean {
        let canRun: boolean = false;
        if (this.data) {
            if (Array.isArray(this.data)) {
                canRun = !!this.data.length;
            } else {
                if (this.data.tableConfiguration.enableSelection && this.data.listenerConfiguration.selectionListener) {
                    const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();
                    canRun = selectedObjects && !!selectedObjects.length;
                }
            }
        }
        return canRun;
    }

    public async run(): Promise<void> {
        if (this.canRun()) {
            if (Array.isArray(this.data)) {
                // TODO: noch implementieren
            } else {
                const columns = await this.data.getColumns();
                let csvString = columns.map((c) => {

                    return `"${this.escapeText(c.text.trim())}"`;
                }).join(';');
                csvString += "\n";

                const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();
                const selectedRows = this.data.getTableRows(true).filter(
                    (r) => selectedObjects.some((s) => s.ObjectId === r.object.ObjectId)
                );

                for (const row of selectedRows) {
                    for (const value of row.values) {
                        const displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                            row.object, value.columnId
                        );
                        const csvValue = this.escapeText(displayValue ? displayValue : value.displayValue);
                        csvString += `"${csvValue}"`;
                        csvString += ';';
                    }
                    csvString += "\n";
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
    }

    private escapeText(text: string): string {
        text = text.replace(/\"/g, '\\"');
        return text;
    }

}
