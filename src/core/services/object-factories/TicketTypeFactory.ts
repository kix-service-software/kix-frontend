import { ObjectFactory } from "./ObjectFactory";
import { TicketType, KIXObjectType } from "../../model";

export class TicketTypeFactory extends ObjectFactory<TicketType> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.TICKET_TYPE;
    }

    public create(type?: TicketType): TicketType {
        return new TicketType(type);
    }

}
