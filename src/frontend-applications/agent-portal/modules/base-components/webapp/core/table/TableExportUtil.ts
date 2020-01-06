/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITable } from "./ITable";
import { LabelService } from "../LabelService";
import { BrowserUtil } from "../BrowserUtil";

export class TableExportUtil {

    public static async export(
        table: ITable, additionalColumns: string[] = [], useDisplayString?: boolean
    ): Promise<void> {
        const csvString = await this.prepareCSVString(table, additionalColumns, useDisplayString);
        const fileName = `Export${table.getObjectType() ? '_' + table.getObjectType() : ''}`;
        BrowserUtil.downloadCSVFile(csvString, fileName);
    }

    private static async prepareCSVString(
        table: ITable, additionalColumns: string[], useDisplayString: boolean = true
    ): Promise<string> {
        const objectType = table.getObjectType();
        const columns = table.getColumns();
        const columnTitles: string[] = [];

        const columnIds = [...columns.map((c) => c.getColumnId()), ...additionalColumns].sort();

        for (const c of columnIds) {
            let value = c;
            if (objectType) {
                value = await LabelService.getInstance().getExportPropertyText(value, objectType, useDisplayString);
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
                    if (useDisplayString) {
                        displayValue = await cell.getDisplayValue();
                    } else {
                        const value = await LabelService.getInstance().getExportPropertyValue(
                            cId, objectType, cell.getValue().objectValue
                        );
                        displayValue = value;
                    }
                } else {
                    if (useDisplayString) {
                        displayValue = await LabelService.getInstance().getPropertyValueDisplayText(
                            row.getRowObject().getObject(), cId
                        );
                    } else {
                        const value = await LabelService.getInstance().getExportPropertyValue(
                            cId, objectType, row.getRowObject().getObject()
                        );
                        displayValue = value;
                    }
                }
                values.push(`"${this.escapeText(displayValue)}"`);
            }
            csvString += values.join(';') + "\n";
        }
        return csvString;
    }

    private static escapeText(text: string): string {
        if (typeof text === 'undefined' || text === null) {
            text = '';
        }
        text = text.toString().replace(/\"/g, '\\"');
        return text;
    }

}
