/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, JobProperty } from "../../../model";
import { ITable, TableValue } from "../../table";
import { Job } from "../../../model/kix/job/Job";
import { KIXObjectService } from "../../kix";
import { ExecPlan } from "../../../model/kix/exec-plan";

export class JobTableContentProvider extends TableContentProvider<Job> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.JOB, table, objectIds, loadingOptions, contextId);
    }

    protected async addSpecificValues(values: TableValue[], job: Job): Promise<any> {
        let execPlans: ExecPlan[] = [];
        if (Array.isArray(job.ExecPlans) && !!job.ExecPlans.length) {
            execPlans = job.ExecPlans;
        } else if (Array.isArray(job.ExecPlanIDs) && !!job.ExecPlanIDs.length) {
            execPlans = await KIXObjectService.loadObjects<ExecPlan>(
                KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, true
            ).catch(() => [] as ExecPlan[]);
        }
        let hasEvents: boolean = false;
        let hasTimes: boolean = false;
        if (execPlans.length) {
            execPlans.forEach((ep) => {
                if (
                    !hasEvents && ep.Parameters
                    && Array.isArray(ep.Parameters.Events) && !!ep.Parameters.Events.length
                ) {
                    hasEvents = true;
                }
                if (
                    !hasTimes && ep.Parameters
                    && Array.isArray(ep.Parameters.Weekdays) && !!ep.Parameters.Weekdays.length
                ) {
                    hasTimes = true;
                }
            });
        }
        values.push(new TableValue(
            JobProperty.TRIGGER_EVENTS, hasTimes ? 'Yes' : 'No', undefined, undefined,
            hasEvents ? ['kix-icon-close'] : null
        ));
        values.push(new TableValue(
            JobProperty.TRIGGER_TIME, hasTimes ? 'Yes' : 'No', undefined, undefined,
            hasTimes ? ['kix-icon-close'] : null
        ));
    }

}
