import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory, StandardTableFactoryService, IdService } from "@kix/core/dist/browser";
import { KIXObjectType, Context } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";

class Component {

    private state: ComponentState;
    private contextListenerId: string = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-history-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(context, faqArticle);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<FAQArticle>());

    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.loading = true;

        this.state.faqArticle = faqArticle;

        if (this.state.faqArticle) {
            this.setActions();
            this.prepareTable();
        }

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.faqArticle]
            );
        }
    }

    private prepareTable(): void {
        const table =
            StandardTableFactoryService.getInstance().createStandardTable(KIXObjectType.FAQ_ARTICLE_HISTORY);

        table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.faqArticle.History);
        table.loadRows();

        this.state.table = table;
    }

}

module.exports = Component;
