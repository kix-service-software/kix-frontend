/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFactory } from '../../../server/model/ObjectFactory';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { JobRun } from '../model/JobRun';

export class JobRunFactory extends ObjectFactory<JobRun> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.JOB_RUN;
    }

    public async create(jobRun?: JobRun): Promise<JobRun> {
        return new JobRun(jobRun);
    }

}
