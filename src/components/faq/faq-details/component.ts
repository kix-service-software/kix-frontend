import { ContextService, ActionFactory, WidgetService, DialogService } from "@kix/core/dist/browser";
import { FAQDetailsContext } from "@kix/core/dist/browser/faq";
import { ComponentState } from './ComponentState';
import { KIXObjectType, AbstractAction, WidgetType } from "@kix/core/dist/model";
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
        context.registerListener('faq-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (faqArticleId: string, faqArticle: FAQArticle, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(context, faqArticle);
                }
            }
        });
        await this.initWidget(context);
    }

    private async initWidget(context: FAQDetailsContext, faqArticle?: FAQArticle): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.state.faqArticle = faqArticle ? faqArticle : await context.getObject<FAQArticle>().catch((error) => null);

        if (!this.state.faqArticle) {
            this.state.error = `Kein FAQ-Artikel mit ID ${context.getObjectId()} verfügbar.`;
        }

        this.state.configuration = context.getConfiguration();
        this.state.lanes = context.getLanes(true);
        this.state.tabWidgets = context.getLaneTabs(true);

        await this.prepareTitle();

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    public async prepareTitle(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.title = await context.getDisplayText();
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
