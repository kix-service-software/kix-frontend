import { WidgetConfiguration, WidgetType } from "../../../model";
import { Context } from "../../../model/components/context/Context";

export class NewFAQArticleDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-faq-article-dialog-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
