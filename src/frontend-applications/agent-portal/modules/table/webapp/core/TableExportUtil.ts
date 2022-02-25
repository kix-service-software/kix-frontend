/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { Table } from '../../model/Table';


export class TableExportUtil {

    public static async export(
        table: Table, additionalColumns?: string[], useColumnDisplayString?: boolean,
        useValueDisplayString?: boolean, sortColumns?: boolean, allRows?: boolean, filename?: string,
        withDate?: boolean
    ): Promise<void> {
        const csvString = await this.prepareCSVString(
            table, additionalColumns, useColumnDisplayString, useValueDisplayString, sortColumns, allRows
        );
        const fileName = filename || `Export${table.getObjectType() ? '_' + table.getObjectType() : ''}`;
        BrowserUtil.downloadCSVFile(csvString, fileName, withDate);
    }

    private static async prepareCSVString(
        table: Table, additionalColumns: string[] = [], useColumnDisplayString: boolean = true,
        useValueDisplayString: boolean = true, sortColumns: boolean = true, allRows: boolean = false
    ): Promise<string> {
        const objectType = table.getObjectType();
        const columns = table.getColumns();
        const columnTitles: string[] = [];

        const columnIds = sortColumns ? [...columns.map((c) => c.getColumnId()), ...additionalColumns].sort()
            : [...columns.map((c) => c.getColumnId()), ...additionalColumns];

        for (const c of columnIds) {
            let value = c;
            if (objectType) {
                value = await LabelService.getInstance().getExportPropertyText(
                    value, objectType, useColumnDisplayString
                );
            }
            columnTitles.push(`"${this.escapeText(value.trim())}"`);
        }

        let csvString = columnTitles.join(';') + '\n';

        const relevantRows = allRows ? table.getRows() : table.getSelectedRows();

        for (const row of relevantRows) {
            const values: string[] = [];
            for (const cId of columnIds) {
                let displayValue = '';
                const cell = row.getCell(cId);
                if (cell && useValueDisplayString) {
                    if (!cell.getValue().displayValue) {
                        await cell.initDisplayValue();
                    }
                    displayValue = cell.getValue().displayValue;
                } else if (useValueDisplayString) {
                    displayValue = await LabelService.getInstance().getDisplayText(
                        row.getRowObject().getObject(), cId
                    );
                } else {
                    const rowObject = row.getRowObject().getObject();
                    const value = await LabelService.getInstance().getExportPropertyValue(
                        cId, objectType, rowObject ? rowObject[cId] : ''
                    );
                    displayValue = value;
                }
                values.push(`"${this.escapeText(displayValue)}"`);
            }
            csvString += values.join(';') + '\n';
        }
        return csvString;
    }

    private static escapeText(text: string): string {
        if (typeof text === 'undefined' || text === null) {
            text = '';
        }
        text = text.toString().replace(/\"/g, '""');
        return text;
    }

}
