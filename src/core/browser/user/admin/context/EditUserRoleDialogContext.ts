import { Context } from "../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../model";
import { EditUserRoleDialogContextConfiguration } from "./EditUserRoleDialogContextConfiguration";

export class EditUserRoleDialogContext extends Context<EditUserRoleDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-user-role-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditUserRoleDialogContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }


    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }
}
