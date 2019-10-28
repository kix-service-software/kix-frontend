/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from "./ObjectFactory";
import { KIXObjectType } from "../../model";
import { Job } from "../../model/kix/job/Job";
import { Macro } from "../../model/kix/macro";
import { ExecPlan } from "../../model/kix/exec-plan";

export class JobFactory extends ObjectFactory<Job> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.JOB;
    }

    public async create(job?: Job): Promise<Job> {
        const newJob = new Job(job);

        newJob.Macros = newJob.Macros
            ? newJob.Macros.map((a) => new Macro(a))
            : null;

        newJob.ExecPlans = newJob.ExecPlans
            ? newJob.ExecPlans.map((ep) => new ExecPlan(ep))
            : null;

        return newJob;
    }

}
