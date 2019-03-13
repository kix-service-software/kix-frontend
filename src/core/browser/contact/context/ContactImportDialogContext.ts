import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType } from "../../../model";
import { ContactImportDialogContextConfiguration } from "./ContactImportDialogContextConfiguration";

export class ContactImportDialogContext extends Context<ContactImportDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'contact-import-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
