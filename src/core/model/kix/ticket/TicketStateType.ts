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
