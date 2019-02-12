import { Context, WidgetType, WidgetConfiguration } from "../../../model";
import { ContactSearchContextConfiguration } from "./ContactSearchContextConfiguration";

export class ContactSearchContext extends Context<ContactSearchContextConfiguration> {

    public static CONTEXT_ID: string = 'search-contact-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
