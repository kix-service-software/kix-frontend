import { TicketState } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketStateBrowserFactory implements IKIXObjectFactory<TicketState> {

    private static INSTANCE: TicketStateBrowserFactory;

    public static getInstance(): TicketStateBrowserFactory {
        if (!TicketStateBrowserFactory.INSTANCE) {
            TicketStateBrowserFactory.INSTANCE = new TicketStateBrowserFactory();
        }
        return TicketStateBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(state: TicketState): Promise<TicketState> {
        return new TicketState(state);
    }

}
