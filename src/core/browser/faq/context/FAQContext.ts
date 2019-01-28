import {
    ConfiguredWidget, Context, WidgetType, WidgetConfiguration,
    KIXObjectType, KIXObjectLoadingOptions, FilterCriteria, FilterType, FilterDataType
} from "../../../model";
import { FAQContextConfiguration } from "./FAQContextConfiguration";
import { FAQCategory, FAQArticleProperty } from "../../../model/kix/faq";
import { EventService } from "../../event";
import { KIXObjectService } from "../../kix";
import { SearchOperator } from "../../SearchOperator";
import { ApplicationEvent } from "../../application";

export class FAQContext extends Context<FAQContextConfiguration> {

    public static CONTEXT_ID: string = 'faq';

    public faqCategory: FAQCategory;

    public getIcon(): string {
        return 'kix-icon-faq';
    }

    public async getDisplayText(): Promise<string> {
        return 'FAQ Dashboard';
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show) {
            content = content.filter(
                (c) => this.configuration.content.findIndex((cid) => c.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const contentWidget = this.configuration.contentWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = contentWidget ? WidgetType.CONTENT : undefined;

        return widgetType;
    }

    public async setFAQCategory(faqCategory: FAQCategory): Promise<void> {
        this.faqCategory = faqCategory;
        await this.loadFAQArticles();
        this.listeners.forEach(
            (l) => l.objectChanged(
                this.faqCategory ? this.faqCategory.ID : null,
                this.faqCategory,
                KIXObjectType.FAQ_CATEGORY)
        );
    }

    private async loadFAQArticles(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, 1000, ['Votes'], ['Votes']);
        if (this.faqCategory) {
            loadingOptions.filter = [new FilterCriteria(
                FAQArticleProperty.CATEGORY_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.faqCategory.ID
            )];
        }

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Lade FAQ Artikel ...`
            });
        }, 500);


        const faqArticles = await KIXObjectService.loadObjects(
            KIXObjectType.FAQ_ARTICLE, null, loadingOptions, null, false
        ).catch((error) => []);
        window.clearTimeout(timeout);
        this.setObjectList(faqArticles);

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public reset(): void {
        this.faqCategory = null;
    }

}
