import { TicketType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketTypeBrowserFactory implements IKIXObjectFactory<TicketType> {

    private static INSTANCE: TicketTypeBrowserFactory;

    public static getInstance(): TicketTypeBrowserFactory {
        if (!TicketTypeBrowserFactory.INSTANCE) {
            TicketTypeBrowserFactory.INSTANCE = new TicketTypeBrowserFactory();
        }
        return TicketTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(type: TicketType): Promise<TicketType> {
        return new TicketType(type);
    }

}
