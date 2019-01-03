import { WidgetConfiguration, WidgetType } from "../../../model";
import { Context } from "../../../model/components/context/Context";

export class NewConfigItemDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-config-item-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
