/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../base-components/webapp/core/table/TableContentProvider";
import { Job } from "../../../model/Job";
import { ITable, TableValue } from "../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ExecPlan } from "../../../model/ExecPlan";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { JobProperty } from "../../../model/JobProperty";

export class JobTableContentProvider extends TableContentProvider<Job> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.JOB, table, objectIds, loadingOptions, contextId);
    }

    protected async prepareSpecificValues(values: TableValue[], job: Job): Promise<void> {
        let execPlans: ExecPlan[] = [];
        if (Array.isArray(job.ExecPlans) && !!job.ExecPlans.length) {
            execPlans = job.ExecPlans;
        } else if (Array.isArray(job.ExecPlanIDs) && !!job.ExecPlanIDs.length) {
            execPlans = await KIXObjectService.loadObjects<ExecPlan>(
                KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, true
            ).catch(() => [] as ExecPlan[]);
        }
        const hasEvents: boolean = execPlans && !!execPlans.length && execPlans.some(
            (ep) => ep.Parameters && Array.isArray(ep.Parameters.Event) && !!ep.Parameters.Event.length
        );
        const hasTimes: boolean = execPlans && !!execPlans.length && execPlans.some(
            (ep) => ep.Parameters
                && Array.isArray(ep.Parameters.Weekday) && !!ep.Parameters.Weekday.length
                && Array.isArray(ep.Parameters.Time) && !!ep.Parameters.Time.length
        );
        values.push(new TableValue(
            JobProperty.HAS_TRIGGER_EVENTS, hasTimes ? 'Yes' : 'No', undefined, undefined,
            hasEvents ? ['kix-icon-close'] : null
        ));
        values.push(new TableValue(
            JobProperty.HAS_TRIGGER_TIMES, hasTimes ? 'Yes' : 'No', undefined, undefined,
            hasTimes ? ['kix-icon-close'] : null
        ));
    }

}
