import { ObjectFactory } from "./ObjectFactory";
import { TicketPriority, KIXObjectType } from "../../model";

export class TicketPriorityFactory extends ObjectFactory<TicketPriority> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_PRIORITY;
    }

    public create(priority?: TicketPriority): TicketPriority {
        return new TicketPriority(priority);
    }


}
