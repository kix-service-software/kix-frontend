import { ContextService, ActionFactory, WidgetService } from "@kix/core/dist/browser";
import { FAQDetailsContext } from "@kix/core/dist/browser/faq";
import { ComponentState } from './ComponentState';
import { KIXObjectType, AbstractAction, WidgetType, KIXObjectLoadingOptions } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";
import { ComponentsService } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public LANE_WIDGET_TYPE = WidgetType.LANE;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.LANE_WIDGET_TYPE = WidgetType.LANE;

        WidgetService.getInstance().setWidgetType('faq-article-widget', WidgetType.LANE);

        const context = (ContextService.getInstance().getActiveContext() as FAQDetailsContext);
        this.state.faqArticleId = context.objectId.toString();
        if (!this.state.faqArticleId) {
            this.state.error = 'No faq article id given.';
        } else {
            this.state.configuration = context.configuration;
            this.state.lanes = context.getLanes(true);
            this.state.tabWidgets = context.getLaneTabs(true);
            await this.loadFAQArticle();
        }
        this.state.loading = false;
    }

    private async loadFAQArticle(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null,
            ['Attachments', 'Votes', 'Links', 'History'], ['Attachments', 'Votes', 'Links', 'History']
        );
        const faqArticles = await ContextService.getInstance().loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [this.state.faqArticleId], loadingOptions
        ).catch((error) => {
            this.state.error = error;
        });

        if (faqArticles && faqArticles.length) {
            this.state.faqArticle = faqArticles[0];
        } else {
            this.state.error = `No faq article found for id ${this.state.faqArticleId}`;
        }
    }

    public getTitle(): string {
        if (this.state.faqArticle) {
            return `${this.state.faqArticle.Number} - ${this.state.faqArticle.Title}`;
        } else {
            return "FAQ Article";
        }
    }

    public getFAQActions(): AbstractAction[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.faqArticle) {
            actions = ActionFactory.getInstance().generateActions(config.faqActions, true, [this.state.faqArticle]);
        }
        return actions;
    }

    public getActions(): AbstractAction[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.faqArticle) {
            actions = ActionFactory.getInstance().generateActions(config.actions, true, [this.state.faqArticle]);
        }
        return actions;
    }

    public getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

}

module.exports = Component;
