import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { EditTranslationDialogContextConfiguration } from "./EditTranslationDialogContextConfiguration";

export class EditTranslationDialogContext extends Context<EditTranslationDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-translation-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: EditTranslationDialogContextConfiguration = null
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
