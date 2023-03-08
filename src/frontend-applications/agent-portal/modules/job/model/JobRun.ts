/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { JobRunLog } from './JobRunLog';

export class JobRun extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.JOB_RUN;

    public ID: number;

    public EndTime: string;

    public Filter: any;

    public JobID: number;

    public Logs: JobRunLog[];

    public StartTime: string;

    public State: string;

    public StateID: number;

    public constructor(jobRun?: JobRun) {
        super(jobRun);
        if (jobRun) {
            this.ObjectId = jobRun.ID;
            this.ID = jobRun.ID;
            this.JobID = jobRun.JobID;
            this.StateID = jobRun.StateID;
            this.State = jobRun.State;
            this.Logs = jobRun.Logs ? jobRun.Logs.map((l) => new JobRunLog(l)) : [];
            this.StartTime = jobRun.StartTime;
            this.EndTime = jobRun.EndTime;
            this.Filter = jobRun.Filter;
        }
    }

}
