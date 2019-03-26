import { NewUserDialogContextConfiguration } from "./NewUserDialogContextConfiguration";
import { ContextDescriptor, WidgetConfiguration, WidgetType, Context } from "../../../../../model";

export class NewUserDialogContext extends Context<NewUserDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-user-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewUserDialogContextConfiguration = null
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
