import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory } from "@kix/core/dist/browser";
import { KIXObjectType, Customer, ContextMode } from "@kix/core/dist/model";
import { FAQArticle, FAQArticleProperty } from "@kix/core/dist/model/kix/faq";
import { FAQLabelProvider } from "@kix/core/dist/browser/faq";
import { Label } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;

    public labelProvider: FAQLabelProvider = new FAQLabelProvider();
    public properties;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new FAQLabelProvider();
        this.properties = FAQArticleProperty;

        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const faqs = await ContextService.getInstance().loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [context.objectId]
        );

        if (faqs && faqs.length) {
            this.state.faqArticle = faqs[0];
            this.setActions();
            this.createLabels();
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

    private createLabels(): void {
        const keywords = ['FAQ', 'ARTICLE', 'KEYWORD', 'HACK', 'WORKAROUND', 'Sonstiges'];
        this.state.labels = keywords.map((k) => new Label(null, k, 'kix-icon-unknown', k, null, k));
    }

}

module.exports = Component;
