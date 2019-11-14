/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { Macro } from "../macro";
import { ExecPlan } from "../exec-plan";
import { ArticleProperty } from "../ticket";

export class Job extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.JOB;

    public ID: number;

    public Name: string;

    public Type: string;

    public LastExecutionTime: string;

    public MacroIDs: number[];

    public Macros: Macro[];

    public ExecPlanIDs: number[];

    public ExecPlans: ExecPlan[];

    public Filter: {};

    public filterMap: Map<string, string[] | number[]>;


    public constructor(job?: Job) {
        super(job);
        this.filterMap = new Map();
        if (job) {
            this.ObjectId = job.ID;
            this.ID = job.ID;
            this.Name = job.Name;
            this.Type = job.Type;
            this.MacroIDs = job.MacroIDs;
            this.Macros = job.Macros ? job.Macros.map((m) => new Macro(m)) : [];
            this.ExecPlanIDs = job.ExecPlanIDs;
            this.ExecPlans = job.ExecPlans ? job.ExecPlans.map((e) => new ExecPlan(e)) : [];
            this.Filter = job.Filter;

            if (job.Filter) {
                const newFilter = {};
                for (const key in job.Filter) {
                    if (job.Filter[key]) {
                        let property = key.replace('Ticket::', '');
                        property = property.replace('Article::', '');
                        if (!this.filterMap.has(property)) {
                            let newValue;
                            if (this.isStringProperty(property)) {
                                newValue = job.Filter[key][0];
                            } else {
                                newValue = job.Filter[key].map((v) => !isNaN(Number(v)) ? Number(v) : v);
                            }
                            this.filterMap.set(property, newValue);
                        }

                        newFilter[property] = Array.isArray(job.Filter[key]) ?
                            job.Filter[key].map((v) => !isNaN(Number(v)) ? Number(v) : v) : job.Filter[key];
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
