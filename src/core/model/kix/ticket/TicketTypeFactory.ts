import { IObjectFactory } from "../IObjectFactory";
import { TicketType } from "./TicketType";
import { KIXObjectType } from "../KIXObjectType";

export class TicketTypeFactory implements IObjectFactory<TicketType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_TYPE;
    }

    public create(type?: TicketType): TicketType {
        return new TicketType(type);
    }

}
