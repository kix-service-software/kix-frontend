import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { NewConfigItemClassDialogContextConfiguration } from "./NewConfigItemClassDialogContextConfiguration";

export class NewConfigItemClassDialogContext extends Context<NewConfigItemClassDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-config-item-class-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewConfigItemClassDialogContextConfiguration = null
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
