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

export class FollowUpType extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.FOLLOW_UP_TYPE;

    public ObjectId: string | number;
    public ID: number;
    public Name: string;
    public Comment: string;
    public ValidID: number;

    public constructor(followUpType?: FollowUpType) {
        super();
        if (followUpType) {
            this.ID = Number(followUpType.ID);
            this.ObjectId = this.ID;
            this.Name = followUpType.Name;
            this.Comment = followUpType.Comment;
            this.ValidID = followUpType.ValidID;
        }
    }

    public equals(followUpType: FollowUpType): boolean {
        return this.ID === followUpType.ID;
    }

}
