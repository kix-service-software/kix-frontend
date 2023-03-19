/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../../../modules/base-components/webapp/core/AbstractAction';
import { Table } from '../../../../../../table/model/Table';
import { TranslationService } from '../../../TranslationService';
import { TranslationPattern } from '../../../../../model/TranslationPattern';

export class TranslationCSVExportAction extends AbstractAction<Table> {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#CSV-Export';
        this.icon = 'kix-icon-export';
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
            let csvString = '"Pattern";' + languages.map((l) => '"' + l[0] + '"').join(';') + '\n';

            const selectedRows = this.data.getSelectedRows();

            const translations = selectedRows.map((r) => r.getRowObject().getObject()) as TranslationPattern[];
            for (const translation of translations) {
                const pattern = this.escapeText(translation.Value);
                csvString += `"${pattern}"`;
                csvString += ';';

                const translationStrings: string[] = [];
                for (const l of languages) {
                    let translationString = '';
                    if (translation.AvailableLanguages.some((al) => al === l[0])) {
                        const translated = await TranslationService.getInstance().getTranslationObject(
                            translation.Value
                        );
                        if (translated && translated.Languages && translated.Languages[l[0]]) {
                            translationString = `"${this.escapeText(translated.Languages[l[0]])}"`;
                        }
                    }
                    translationStrings.push(translationString);
                }
                csvString += translationStrings.join(';') + '\n';
            }

            if (window.navigator.msSaveOrOpenBlob) {
                const blob = new Blob([csvString]);
                window.navigator.msSaveBlob(blob, 'Export.csv');
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
