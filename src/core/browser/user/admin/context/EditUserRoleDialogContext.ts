import { Context } from "../../../../model/components/context/Context";
import { ContextDescriptor, ContextConfiguration } from "../../../../model";

export class EditUserRoleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-user-role-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

}
