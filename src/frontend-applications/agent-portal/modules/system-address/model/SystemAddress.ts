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

export class SystemAddress extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    public ObjectId: string | number;

    public Comment: string;
    public ID: string | number;
    public Name: string;
    public Realname: string;
    public QueueIDs: number[];

    public constructor(
        systemAddress?: SystemAddress
    ) {
        super();
        if (systemAddress) {
            this.ID = systemAddress.ID;
            this.ObjectId = this.ID;
            this.ChangeBy = systemAddress.ChangeBy;
            this.ChangeTime = systemAddress.ChangeTime;
            this.Comment = systemAddress.Comment;
            this.CreateBy = systemAddress.CreateBy;
            this.CreateTime = systemAddress.CreateTime;
            this.Name = systemAddress.Name;
            this.Realname = systemAddress.Realname;
            this.ValidID = systemAddress.ValidID;
            this.QueueIDs = systemAddress.QueueIDs;
        }
    }

    public equals(systemAddress: SystemAddress): boolean {
        return this.ID === systemAddress.ID;
    }

}
