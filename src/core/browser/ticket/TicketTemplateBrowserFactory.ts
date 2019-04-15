import { TicketTemplate } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class TicketTemplateBrowserFactory implements IKIXObjectFactory<TicketTemplate> {

    private static INSTANCE: TicketTemplateBrowserFactory;

    public static getInstance(): TicketTemplateBrowserFactory {
        if (!TicketTemplateBrowserFactory.INSTANCE) {
            TicketTemplateBrowserFactory.INSTANCE = new TicketTemplateBrowserFactory();
        }
        return TicketTemplateBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(template: TicketTemplate): Promise<TicketTemplate> {
        return new TicketTemplate(template);
    }

}
