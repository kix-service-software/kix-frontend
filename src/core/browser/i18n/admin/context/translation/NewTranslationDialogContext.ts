import { Context } from "../../../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType, ContextDescriptor } from "../../../../../model";
import { NewTranslationDialogContextConfiguration } from "./NewTranslationDialogContextConfiguration";

export class NewTranslationDialogContext extends Context<NewTranslationDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-translation-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: NewTranslationDialogContextConfiguration = null
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
