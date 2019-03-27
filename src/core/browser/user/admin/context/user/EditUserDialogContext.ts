import { ContextDescriptor, WidgetConfiguration, WidgetType, Context } from "../../../../../model";
import { EditUserDialogContextConfiguration } from "./EditUserDialogContextConfiguration";

export class EditUserDialogContext extends Context<EditUserDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-user-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditUserDialogContextConfiguration = null
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
