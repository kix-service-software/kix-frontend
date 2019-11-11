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

    public constructor(job?: Job) {
        super(job);
        if (job) {
            this.ObjectId = job.ID;
            this.ID = job.ID;
            this.Name = job.Name;
            this.Type = job.Type;
            this.MacroIDs = job.MacroIDs;
            this.Macros = job.Macros;
            this.ExecPlanIDs = job.ExecPlanIDs;
            this.ExecPlans = job.ExecPlans;
        }
    }

}
