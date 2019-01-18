import { TicketStateType } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketStateTypeBrowserFactory implements IKIXObjectFactory<TicketStateType> {

    private static INSTANCE: TicketStateTypeBrowserFactory;

    public static getInstance(): TicketStateTypeBrowserFactory {
        if (!TicketStateTypeBrowserFactory.INSTANCE) {
            TicketStateTypeBrowserFactory.INSTANCE = new TicketStateTypeBrowserFactory();
        }
        return TicketStateTypeBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(stateType: TicketStateType): Promise<TicketStateType> {
        return new TicketStateType(stateType);
    }

}
