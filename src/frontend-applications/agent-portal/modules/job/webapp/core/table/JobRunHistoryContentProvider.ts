/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { JobRun } from '../../../model/JobRun';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';
import { KIXObjectSpecificLoadingOptions } from '../../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObject } from '../../../../../model/kix/KIXObject';

export class JobRunHistoryContentProvider extends TableContentProvider<JobRun> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string,
        objects?: KIXObject[],
        specificLoadingOptions?: KIXObjectSpecificLoadingOptions
    ) {
        super(
            KIXObjectType.JOB_RUN, table, objectIds, loadingOptions, contextId,
            objects, specificLoadingOptions
        );
    }

    public async getRowObjects(objects: JobRun[]): Promise<RowObject[]> {
        const rowObjects = [];
        for (const o of objects) {
            const values: TableValue[] = [];

            const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
            for (const column of columns) {
                const tableValue = new TableValue(column.property, o[column.property]);
                values.push(tableValue);
            }

            rowObjects.push(new RowObject<JobRun>(values, o));
        }

        return rowObjects;
    }

}
