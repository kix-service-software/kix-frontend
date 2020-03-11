/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from "../../../../modules/base-components/webapp/core/KIXObjectFactory";
import { Job } from "../../model/Job";
import { Macro } from "../../model/Macro";
import { ExecPlan } from "../../model/ExecPlan";

export class JobBrowserFactory extends KIXObjectFactory<Job> {

    private static INSTANCE: JobBrowserFactory;

    public static getInstance(): JobBrowserFactory {
        if (!JobBrowserFactory.INSTANCE) {
            JobBrowserFactory.INSTANCE = new JobBrowserFactory();
        }
        return JobBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(job: Job): Promise<Job> {
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
