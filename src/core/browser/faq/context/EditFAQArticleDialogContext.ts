import { Context } from "../../../model/components/context/Context";
import { WidgetConfiguration, WidgetType } from "../../../model";
import { EditFAQArticleDialogContextConfiguration } from "./EditFAQArticleDialogContextConfiguration";

export class EditFAQArticleDialogContext extends Context<EditFAQArticleDialogContextConfiguration> {

    public static CONTEXT_ID: string = 'edit-contact-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
