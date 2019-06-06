import { ContextDescriptor, Context, ContextConfiguration } from "../../../model";

export class EditTextModuleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-text-module-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }
}
