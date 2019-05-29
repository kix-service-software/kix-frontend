import { IObjectFactory } from "../IObjectFactory";
import { TicketState } from "./TicketState";
import { KIXObjectType } from "../KIXObjectType";

export class TicketStateFactory implements IObjectFactory<TicketState> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_STATE;
    }

    public create(state?: TicketState): TicketState {
        return new TicketState(state);
    }

}
