import { TicketPriority } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketPriorityBrowserFactory implements IKIXObjectFactory<TicketPriority> {

    private static INSTANCE: TicketPriorityBrowserFactory;

    public static getInstance(): TicketPriorityBrowserFactory {
        if (!TicketPriorityBrowserFactory.INSTANCE) {
            TicketPriorityBrowserFactory.INSTANCE = new TicketPriorityBrowserFactory();
        }
        return TicketPriorityBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(type: TicketPriority): Promise<TicketPriority> {
        return new TicketPriority(type);
    }

}
