import { ObjectFactory } from "./ObjectFactory";
import { TicketState, KIXObjectType } from "../../model";

export class TicketStateFactory extends ObjectFactory<TicketState> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_STATE;
    }

    public create(state?: TicketState): TicketState {
        return new TicketState(state);
    }

}
