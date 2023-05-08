/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SortUtil } from '../../../../model/SortUtil';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
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

        const columnIds = sortColumns ?
            [...columns.map((c) => c.getColumnId()), ...additionalColumns].sort(
                this.sortProperties.bind(useColumnDisplayString)
            )
            : [...columns.map((c) => c.getColumnId()), ...additionalColumns];

        // add dynamic field key column for import purpose
        if (!useValueDisplayString) {
            const dfColumnIds = columnIds.filter((cid) => cid.match(/^DynamicField/));
            columnIds.push(...dfColumnIds.map((cid) => `${cid}_key`));
        }

        for (const c of columnIds) {
            let columnTitle = c;
            if (objectType) {
                columnTitle = await LabelService.getInstance().getExportPropertyText(
                    columnTitle, objectType, useColumnDisplayString
                );
            }
            columnTitles.push(`"${this.escapeText(columnTitle.trim())}"`);
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
                    displayValue = await LabelService.getInstance().getExportPropertyValue(
                        cId, objectType, rowObject ? rowObject[cId] : '', rowObject
                    );
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

    private static sortProperties(a: string, b: string, useColumnDisplayString: boolean): number {
        if (useColumnDisplayString) {
            return SortUtil.compareString(a, b);
        } else {
            const dfa = KIXObjectService.getDynamicFieldName(a);
            const dfb = KIXObjectService.getDynamicFieldName(b);
            return SortUtil.compareString(dfa || a, dfb || b);
        }
    }

}
