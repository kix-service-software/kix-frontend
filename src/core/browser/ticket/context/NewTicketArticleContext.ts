import { Context, WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../model";
import { NewTicketArticleContextConfiguration } from "./NewTicketArticleContextConfiguration";

export class NewTicketArticleContext extends Context<NewTicketArticleContextConfiguration> {

    public static CONTEXT_ID: string = 'new-ticket-article-dialog-context';

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewTicketArticleContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration {
        return null;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return null;
    }

}
