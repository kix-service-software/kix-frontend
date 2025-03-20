/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { LogFile } from '../../../model/LogFile';
import { LogFolder } from '../../../model/LogFolder';
import { LogFileProperty } from '../../../model/LogFileProperty';
import { LogTier } from '../../../model/LogTier';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';
import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';

export class LogFileTableContentProvider extends TableContentProvider<LogFile> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.LOG_FILE, table, objectIds, loadingOptions, contextId);
        this.useCache = false;
    }

    public async getRowObjects(logFiles: LogFile[] = []): Promise<RowObject[]> {
        const rowObjects: Array<RowObject<LogFile | LogFolder>> = [];

        const beRowObject = new RowObject(
            [new TableValue(LogFileProperty.FILE_NAME, 'Backend Server', 'Backend Server')],
            new LogFolder('Backend Server')
        );
        rowObjects.push(beRowObject);

        const feRowObject = new RowObject(
            [new TableValue(LogFileProperty.FILE_NAME, 'Frontend Server', 'Frontend Server')],
            new LogFolder('Frontend Server')
        );
        rowObjects.push(feRowObject);

        const folder: Map<number, RowObject[]> = new Map();

        for (const lf of logFiles) {
            const logHierarchie = lf.DisplayName?.split('/') || [];
            let currentFolderObject = lf.tier === LogTier.BACKEND ? beRowObject : feRowObject;
            logHierarchie.forEach((l, i) => {

                if (!folder.has(i)) {
                    folder.set(i, []);
                }

                if (i === logHierarchie.length - 1) {
                    // create a logfile entry
                    const values: TableValue[] = [];
                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const tableValue = new TableValue(
                            column.property, lf[column.property], null, null, null
                        );
                        values.push(tableValue);
                    }
                    const rowObject = new RowObject(values, lf);

                    const existingFolder = folder.get(i).find((fo) => fo.getObject().DisplayName === l);
                    const folderObject = existingFolder || currentFolderObject;
                    folderObject.addChild(rowObject);
                } else {
                    // create a folder entry
                    let rowObject = folder.get(i).find((fo) => fo.getObject().DisplayName === l);
                    if (!rowObject) {
                        rowObject = new RowObject(
                            [new TableValue(LogFileProperty.FILE_NAME, l, l)],
                            new LogFolder(l)
                        );
                        folder.get(i).push(rowObject);
                        currentFolderObject.addChild(rowObject);
                    }
                    currentFolderObject = rowObject;
                }
            });
        }

        return rowObjects;
    }

}
