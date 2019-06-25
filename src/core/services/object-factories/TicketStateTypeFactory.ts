import { ObjectFactory } from "./ObjectFactory";
import { TicketStateType, KIXObjectType } from "../../model";

export class TicketStateTypeFactory extends ObjectFactory<TicketStateType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public create(stateType?: TicketStateType): TicketStateType {
        return new TicketStateType(stateType);
    }

}
