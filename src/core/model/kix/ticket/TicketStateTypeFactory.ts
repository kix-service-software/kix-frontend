import { IObjectFactory } from "../IObjectFactory";
import { TicketStateType } from "./TicketStateType";
import { KIXObjectType } from "../KIXObjectType";

export class TicketStateTypeFactory implements IObjectFactory<TicketStateType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public create(stateType?: TicketStateType): TicketStateType {
        return new TicketStateType(stateType);
    }

}
