/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';


export class TicketPriority extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public ObjectId: number;

    public ID: number;

    public Name: string;

    public ChangeTime: string;

    public CreateTime: string;

    public ValidID: number;

    public ChangeBy: number;

    public CreateBy: number;

    public Comment: string;

    public constructor(priority?: TicketPriority) {
        super();
        if (priority) {
            this.ID = Number(priority.ID);
            this.ObjectId = this.ID;
            this.Name = priority.Name;
            this.ChangeBy = priority.ChangeBy;
            this.ChangeTime = priority.ChangeTime;
            this.CreateBy = priority.CreateBy;
            this.CreateTime = priority.CreateTime;
            this.ValidID = priority.ValidID;
            this.Comment = priority.Comment;
        }
    }

    public equals(priority: TicketPriority): boolean {
        return this.ID === priority.ID;
    }

    public toString(): string {
        return this.Name;
    }

}
