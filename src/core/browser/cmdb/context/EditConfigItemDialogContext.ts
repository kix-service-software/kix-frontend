import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor, } from "../../../model";
import { EditConfigItemDialogContextConfiguration } from "./EditConfigItemDialogContextConfiguration";

export class EditConfigItemDialogContext extends Context<EditConfigItemDialogContextConfiguration>  {

    public static CONTEXT_ID: string = 'edit-config-item-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditConfigItemDialogContextConfiguration = null
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
