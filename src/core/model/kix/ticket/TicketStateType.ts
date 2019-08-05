/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class TicketStateType extends KIXObject<TicketStateType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(state?: TicketStateType) {
        super();
        if (state) {
            this.ID = Number(state.ID);
            this.ObjectId = this.ID;
            this.Name = state.Name;
        }
    }

    public equals(state: TicketStateType): boolean {
        return this.ID === state.ID;
    }

}
