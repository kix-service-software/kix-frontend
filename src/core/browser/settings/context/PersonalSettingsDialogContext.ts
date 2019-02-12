import { WidgetConfiguration, WidgetType } from "../../../model";
import { Context } from "../../../model/components/context/Context";

export class PersonalSettingsDialogContext extends Context {

    public static CONTEXT_ID: string = 'personal-settings-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
