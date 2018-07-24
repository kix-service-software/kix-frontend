import { KIXObjectType, WidgetType } from "@kix/core/dist/model";
import { ContextService, ActionFactory, WidgetService } from "@kix/core/dist/browser";
import { ComponentState } from './ComponentState';
import { FAQArticle } from "@kix/core/dist/model/kix/faq";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('faq-article-group', WidgetType.GROUP);

        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const faqs = await ContextService.getInstance().loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [context.objectId]
        );

        if (faqs && faqs.length) {
            this.state.faqArticle = faqs[0];

            this.setActions();
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.faqArticle]
            );
        }
    }
}

module.exports = Component;
