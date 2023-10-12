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

export class Watcher extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.WATCHER;

    public ID: number;

    public TicketID: number;

    public UserID: number;

    public CreateBy: number;

    public CreateTime: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public constructor(watcher?: Watcher) {
        super();

        if (watcher) {
            this.ID = Number(watcher.ID);
            this.TicketID = Number(watcher.TicketID);
            this.ObjectId = this.ID;
            this.UserID = watcher.UserID;
            this.CreateBy = watcher.CreateBy;
            this.CreateTime = watcher.CreateTime;
            this.ChangeBy = watcher.ChangeBy;
            this.ChangeTime = watcher.ChangeTime;
        }
    }

    public equals(watcher: Watcher): boolean {
        return this.ID === watcher.ID;
    }
}
