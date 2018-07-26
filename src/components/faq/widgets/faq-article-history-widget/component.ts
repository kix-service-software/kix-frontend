import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory, StandardTableFactoryService } from "@kix/core/dist/browser";
import { KIXObjectType } from "@kix/core/dist/model";
import { FAQArticle } from "@kix/core/dist/model/kix/faq";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const faqs = await ContextService.getInstance().loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [context.objectId]
        );

        if (faqs && faqs.length) {
            this.state.faqArticle = faqs[0];
            this.setActions();
            this.prepareTable();
        }

        this.state.loading = false;
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
