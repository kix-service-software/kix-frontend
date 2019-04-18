import { Context } from "../../../../../model/components/context/Context";
import { ContextDescriptor, ContextConfiguration } from "../../../../../model";

export class NewConfigItemClassDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-config-item-class-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

}
