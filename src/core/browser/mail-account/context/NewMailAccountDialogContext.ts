import { ContextDescriptor, Context, ContextConfiguration } from "../../../model";

export class NewMailAccountDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-mail-account-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}
