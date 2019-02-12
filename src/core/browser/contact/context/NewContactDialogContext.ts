import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType } from "../../../model";
import { NewContactDialogContextConfiguration } from "./NewContactDialogContextConfiguration";

export class NewContactDialogContext extends Context<NewContactDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'new-contact-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
