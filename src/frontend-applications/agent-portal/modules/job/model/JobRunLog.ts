/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class JobRunLog extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.JOB_RUN_LOG;

    public ID: number;

    public RunID: number;

    public JobID: number;

    public MacroID: number;

    public MacroActionID: number;

    public ObjectID: number;

    public Message: string;

    public Priority: string;

    public constructor(jobRunLog?: JobRunLog) {
        super(jobRunLog);
        if (jobRunLog) {
            this.ObjectId = jobRunLog.ID;
            this.ID = jobRunLog.ID;
            this.RunID = jobRunLog.RunID;
            this.JobID = jobRunLog.JobID;
            this.MacroID = jobRunLog.MacroID;
            this.MacroActionID = jobRunLog.MacroActionID;
            this.ObjectID = jobRunLog.ObjectID;
            this.Message = jobRunLog.Message;
            this.Priority = jobRunLog.Priority;
        }
    }

}
