/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { Macro } from "./Macro";
import { ArticleProperty } from "../../ticket/model/ArticleProperty";
import { ExecPlan } from "./ExecPlan";
import { KIXObjectProperty } from "../../../model/kix/KIXObjectProperty";
import { JobTypes } from "./JobTypes";

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

    public Filter: any;

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
            this.Filter = job.Filter;

            if (job.Filter) {
                const newFilter = {};
                for (const key in job.Filter) {
                    if (job.Filter[key]) {
                        let property = key.replace('Ticket::', '');
                        property = property.replace('Article::', '');
                        property = property.replace(
                            /^DynamicField_(.+)$/, `${KIXObjectProperty.DYNAMIC_FIELDS}.$1`
                        );
                        if (this.isStringProperty(property)) {
                            newFilter[property] = Array.isArray(job.Filter[key]) ?
                                job.Filter[key][0] : job.Filter[key];
                        } else {
                            newFilter[property] = Array.isArray(job.Filter[key]) ?
                                job.Filter[key].map((v) => !isNaN(Number(v)) ? Number(v) : v) : job.Filter[key];
                        }

                    }
                }
                this.Filter = newFilter;
            }
        }
    }

    private isStringProperty(property: string): boolean {
        return property === ArticleProperty.FROM
            || property === ArticleProperty.TO
            || property === ArticleProperty.CC
            || property === ArticleProperty.BCC
            || property === ArticleProperty.SUBJECT
            || property === ArticleProperty.BODY;
    }

}
