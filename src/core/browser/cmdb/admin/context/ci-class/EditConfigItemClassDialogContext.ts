import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { EditConfigItemClassDialogContextConfiguration } from "./EditConfigItemClassDialogContextConfiguration";

export class EditConfigItemClassDialogContext extends Context<EditConfigItemClassDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-config-item-class-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditConfigItemClassDialogContextConfiguration = null
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
