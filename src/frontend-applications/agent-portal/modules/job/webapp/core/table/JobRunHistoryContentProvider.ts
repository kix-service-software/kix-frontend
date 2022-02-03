/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { JobRun } from '../../../model/JobRun';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { JobRunProperty } from '../../../model/JobRunProperty';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class JobRunHistoryContentProvider extends TableContentProvider<JobRun> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.JOB_RUN, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<JobRun>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const jobId = await context.getObjectId();
            if (jobId) {
                const jobRuns = await KIXObjectService.loadObjects<JobRun>(
                    KIXObjectType.JOB_RUN, undefined,
                    new KIXObjectLoadingOptions(
                        null, null, null, [JobRunProperty.LOGS]
                    ),
                    { id: jobId }
                ).catch(() => [] as JobRun[]);

                if (jobRuns && jobRuns.length) {
                    for (const run of jobRuns) {
                        const values: TableValue[] = [];

                        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                        for (const column of columns) {
                            const tableValue = new TableValue(column.property, run[column.property]);
                            values.push(tableValue);
                        }

                        rowObjects.push(new RowObject<JobRun>(values, run));
                    }
                }
            }
        }

        return rowObjects;
    }

}
