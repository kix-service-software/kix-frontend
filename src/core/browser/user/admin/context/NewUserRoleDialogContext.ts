import { Context } from "../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../model";
import { NewUserRoleDialogContextConfiguration } from "./NewUserRoleDialogContextConfiguration";

export class NewUserRoleDialogContext extends Context<NewUserRoleDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-user-role-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewUserRoleDialogContextConfiguration = null
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
