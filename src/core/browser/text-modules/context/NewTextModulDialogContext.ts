import { ContextDescriptor, Context, ContextConfiguration } from "../../../model";

export class NewTextModuleDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-text-module-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}
