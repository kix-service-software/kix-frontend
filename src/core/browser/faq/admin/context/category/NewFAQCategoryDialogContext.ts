import { ContextDescriptor, ContextConfiguration, Context } from "../../../../../model";

export class NewFAQCategoryDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-faq-category-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

}
