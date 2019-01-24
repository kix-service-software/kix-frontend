import { AbstractAction, Translation } from "../../../../../model";
import { StandardTable } from "../../../../standard-table";
import { TranslationService } from "../../../TranslationService";

export class TranslationCSVExportAction extends AbstractAction<StandardTable> {

    public initAction(): void {
        this.text = "CSV-Export";
        this.icon = "kix-icon-print";
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
                const languages = await TranslationService.getInstance().getLanguages();
                let csvString = '"Pattern";' + languages.map((l) => '"' + l[0] + '"').join(';') + "\n";

                const selectedObjects = this.data.listenerConfiguration.selectionListener.getSelectedObjects();
                const selectedRows = this.data.getTableRows(true).filter(
                    (r) => selectedObjects.some((s) => s.ObjectId === r.object.ObjectId)
                );

                const translations = selectedRows.map((r) => r.object) as Translation[];
                for (const translation of translations) {
                    const pattern = this.escapeText(translation.Pattern);
                    csvString += `"${pattern}"`;
                    csvString += ';';

                    languages.forEach((l) => {
                        const language = translation.Languages.find((tl) => tl.Language === l[0]);
                        if (language) {
                            csvString += `"${this.escapeText(language.Value)}"`;
                        }
                        csvString += ';';
                    });
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
