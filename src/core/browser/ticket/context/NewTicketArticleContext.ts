import { Context, ContextDescriptor, ContextConfiguration } from "../../../model";

export class NewTicketArticleContext extends Context {

    public static CONTEXT_ID: string = 'new-ticket-article-dialog-context';

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

}
