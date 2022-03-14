/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../model/kix/KIXObject';
import { JobTypes } from './JobTypes';

export class JobType extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.JOB_TYPE;

    public Name: string;

    public DisplayName: string;

    public Type: JobTypes | string;

    public constructor(jobType?: JobType) {
        super(jobType);
        if (jobType) {
            this.ObjectId = jobType.Name;
            this.Name = jobType.Name;
            this.DisplayName = jobType.DisplayName;
            this.Type = jobType.Name;
        }
    }

    public getIdPropertyName(): string {
        return 'Name';
    }

}
