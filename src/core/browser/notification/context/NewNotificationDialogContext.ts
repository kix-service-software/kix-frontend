import { ContextDescriptor, Context, ContextConfiguration } from "../../../model";

export class NewNotificationDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-notification-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}
