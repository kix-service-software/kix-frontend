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


export class TicketState extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public TypeName: string;

    public Comment: string;

    public ChangeTime: string;

    public ChangeBy: number;

    public CreateTime: string;

    public CreateBy: number;

    public ValidID: number;

    public TypeID: number;

    public constructor(state?: TicketState) {
        super();
        if (state) {
            this.ID = Number(state.ID);
            this.ObjectId = this.ID;
            this.Name = state.Name;
            this.TypeName = state.TypeName;
            this.Comment = state.Comment;
            this.ChangeTime = state.ChangeTime;
            this.ChangeBy = state.ChangeBy;
            this.CreateTime = state.CreateTime;
            this.CreateBy = state.CreateBy;
            this.ValidID = state.ValidID;
            this.TypeID = state.TypeID;
        }
    }

    public equals(state: TicketState): boolean {
        return this.ID === state.ID;
    }

    public toString(): string {
        return this.Name;
    }

}
