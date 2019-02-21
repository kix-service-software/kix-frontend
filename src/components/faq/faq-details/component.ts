import { ContextService, ActionFactory, WidgetService } from "../../../core/browser";
import { FAQDetailsContext } from "../../../core/browser/faq";
import { ComponentState } from './ComponentState';
import { KIXObjectType, AbstractAction, WidgetType } from "../../../core/model";
import { FAQArticle } from "../../../core/model/kix/faq";
import { ComponentsService } from "../../../core/browser/components";

class Component {

    private state: ComponentState;

    public LANE_WIDGET_TYPE = WidgetType.LANE;

    private context: FAQDetailsContext;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.LANE_WIDGET_TYPE = WidgetType.LANE;
        WidgetService.getInstance().setWidgetType('faq-article-widget', WidgetType.LANE);

        this.context = await ContextService.getInstance().getContext<FAQDetailsContext>(FAQDetailsContext.CONTEXT_ID);
        this.context.registerListener('faq-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (faqArticleId: string, faqArticle: FAQArticle, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(faqArticle);
                }
            }
        });
        await this.initWidget();
    }

    private async initWidget(faqArticle?: FAQArticle): Promise<void> {
        this.state.error = null;
        this.state.loading = true;
        this.state.faqArticle = faqArticle
            ? faqArticle
            : await this.context.getObject<FAQArticle>().catch((error) => null);

        if (!this.state.faqArticle) {
            this.state.error = `Kein FAQ-Artikel mit ID ${this.context.getObjectId()} verfügbar.`;
        }

        this.state.configuration = this.context.getConfiguration();
        this.state.lanes = this.context.getLanes(true);
        this.state.tabWidgets = this.context.getLaneTabs(true);
        this.state.contentWidgets = this.context.getContent();

        await this.prepareTitle();

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    public async prepareTitle(): Promise<void> {
        this.state.title = await this.context.getDisplayText();
    }

    public getFAQActions(): AbstractAction[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.faqArticle) {
            actions = ActionFactory.getInstance().generateActions(config.faqActions, [this.state.faqArticle]);
        }
        return actions;
    }

    public getActions(): AbstractAction[] {
        let actions = [];
        const config = this.state.configuration;
        if (config && this.state.faqArticle) {
            actions = ActionFactory.getInstance().generateActions(config.actions, [this.state.faqArticle]);
        }
        return actions;
    }

    public getWidgetTemplate(instanceId: string): any {
        const config = this.context ? this.context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

}

module.exports = Component;
