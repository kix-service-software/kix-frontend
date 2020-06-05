/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFactory } from '../../../base-components/webapp/core/KIXObjectFactory';
import { JobRun } from '../../model/JobRun';

export class JobRunBrowserFactory extends KIXObjectFactory<JobRun> {

    private static INSTANCE: JobRunBrowserFactory;

    public static getInstance(): JobRunBrowserFactory {
        if (!JobRunBrowserFactory.INSTANCE) {
            JobRunBrowserFactory.INSTANCE = new JobRunBrowserFactory();
        }
        return JobRunBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(jobRun: JobRun): Promise<JobRun> {
        return new JobRun(jobRun);
    }

}
