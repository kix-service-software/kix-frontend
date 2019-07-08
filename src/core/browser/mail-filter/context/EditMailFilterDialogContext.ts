import { ContextDescriptor, Context, ContextConfiguration } from "../../../model";

export class EditMailFilterDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-mail-filter-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}
