/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { Macro } from './Macro';
import { ExecPlan } from './ExecPlan';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { JobTypes } from './JobTypes';

export class Job extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.JOB;

    public ID: number;

    public Name: string;

    public Type: JobTypes;

    public LastExecutionTime: string;

    public MacroIDs: number[];

    public Macros: Macro[];

    public ExecPlanIDs: number[];

    public ExecPlans: ExecPlan[];

    public Filter: any[];

    public constructor(job?: Job) {
        super(job);
        if (job) {
            this.ObjectId = job.ID;
            this.ID = job.ID;
            this.Name = job.Name;
            this.Type = job.Type;
            this.MacroIDs = job.MacroIDs;
            this.Macros = job.Macros ? job.Macros.map((m) => new Macro(m)) : [];
            this.ExecPlanIDs = job.ExecPlanIDs;
            this.ExecPlans = job.ExecPlans ? job.ExecPlans.map((e) => new ExecPlan(e)) : [];
            this.LastExecutionTime = job.LastExecutionTime;
            this.Filter = job.Filter && !Array.isArray(job.Filter) ?
                [job.Filter] : job.Filter;

            this.Macros = job.Macros
                ? job.Macros.map((a) => new Macro(a))
                : null;

            this.ExecPlans = job.ExecPlans
                ? job.ExecPlans.map((ep) => new ExecPlan(ep))
                : null;

            this.prepareFilter();
        }
    }

    private prepareFilter(): void {
        if (Array.isArray(this.Filter)) {
            this.Filter.forEach((filter) => {
                if (typeof filter === 'object') {
                    // key = AND or OR
                    for (const key in filter) {
                        if (Array.isArray(filter[key])) {
                            const preparedFilter = [];
                            for (const filterCriteria of filter[key]) {
                                if (filterCriteria.Field.match(/^DynamicField_/)) {
                                    filterCriteria.Field = filterCriteria.Field.replace(
                                        /^DynamicField_(.+)$/, `${KIXObjectProperty.DYNAMIC_FIELDS}.$1`
                                    );
                                }
                                this.prepareObjectFilter(preparedFilter, filterCriteria);
                            }
                            filter[key] = preparedFilter;
                        }
                    }
                }
            });
        }
    }
}
