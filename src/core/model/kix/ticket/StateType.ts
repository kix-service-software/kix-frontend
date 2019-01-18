import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class StateType extends KIXObject<StateType> {

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public ObjectId: string | number;

    public ID: number;

    public Name: string;

    public constructor(stateType?: StateType) {
        super();
        if (stateType) {
            this.ID = Number(stateType.ID);
            this.ObjectId = this.ID;
            this.Name = stateType.Name;
        }
    }

    public equals(stateType: StateType): boolean {
        return this.ID === stateType.ID;
    }

}
