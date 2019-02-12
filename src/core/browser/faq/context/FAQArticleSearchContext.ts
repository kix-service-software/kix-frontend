import { Context, WidgetType, WidgetConfiguration } from "../../../model";
import { FAQArticleSearchContextConfiguration } from "./FAQArticleSearchContextConfiguration";

export class FAQArticleSearchContext extends Context<FAQArticleSearchContextConfiguration> {

    public static CONTEXT_ID: string = 'search-faq-article-context';

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        return undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        return undefined;
    }

}
