import { AbstractAction, Translation } from "../../../../../model";
import { TranslationService } from "../../../TranslationService";
import { ITable } from "../../../../table";

export class TranslationCSVExportAction extends AbstractAction<ITable> {

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

            const languages = await TranslationService.getInstance().getLanguages();
            let csvString = '"Pattern";' + languages.map((l) => '"' + l[0] + '"').join(';') + "\n";

            const selectedRows = this.data.getSelectedRows();

            const translations = selectedRows.map((r) => r.getRowObject().getObject()) as Translation[];
            for (const translation of translations) {
                const pattern = this.escapeText(translation.Pattern);
                csvString += `"${pattern}"`;
                csvString += ';';

                const translationStrings: string[] = [];
                languages.forEach((l) => {
                    const language = translation.Languages.find((tl) => tl.Language === l[0]);
                    let translationString = '';
                    if (language) {
                        translationString = `"${this.escapeText(language.Value)}"`;
                    }
                    translationStrings.push(translationString);
                });
                csvString += translationStrings.join(';') + "\n";
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
