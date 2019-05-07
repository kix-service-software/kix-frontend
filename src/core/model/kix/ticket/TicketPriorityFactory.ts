import { IObjectFactory } from "../IObjectFactory";
import { TicketPriority } from "./TicketPriority";
import { KIXObjectType } from "../KIXObjectType";

export class TicketPriorityFactory implements IObjectFactory<TicketPriority> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_PRIORITY;
    }

    public create(priority?: TicketPriority): TicketPriority {
        return new TicketPriority(priority);
    }


}
