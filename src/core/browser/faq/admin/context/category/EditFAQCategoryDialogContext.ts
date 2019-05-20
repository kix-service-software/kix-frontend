import { ContextDescriptor, ContextConfiguration, Context } from "../../../../../model";

export class EditFAQCategoryDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-faq-category-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

}
