import { ContextDescriptor, Context, ContextConfiguration } from "../../../model";

export class NewMailFilterDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-mail-filter-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}
