/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class TicketLock extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_LOCK;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public ValidID: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public constructor(lock?: TicketLock) {
        super();
        if (lock) {
            this.ID = lock.ID;
            this.ObjectId = this.ID;
            this.Name = lock.Name;
            this.ValidID = lock.ValidID;
            this.CreateBy = lock.CreateBy;
            this.CreateTime = lock.CreateTime;
            this.ChangeBy = lock.ChangeBy;
            this.ChangeTime = lock.ChangeTime;
        }
    }

    public equals(lock: TicketLock): boolean {
        return this.ID === lock.ID;
    }

}
