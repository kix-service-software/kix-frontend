import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory, IdService } from "@kix/core/dist/browser";
import { KIXObjectType, Customer, ContextMode, Context } from "@kix/core/dist/model";
import { FAQArticle, FAQArticleProperty } from "@kix/core/dist/model/kix/faq";
import { FAQLabelProvider } from "@kix/core/dist/browser/faq";
import { Label } from "@kix/core/dist/browser/components";

class Component {

    private state: ComponentState;
    private contextListenerId: string = null;

    public labelProvider: FAQLabelProvider = new FAQLabelProvider();
    public properties;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-info-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new FAQLabelProvider();
        this.properties = FAQArticleProperty;

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

        await this.initWidget(context);
    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.loading = true;

        this.state.faqArticle = faqArticle ? faqArticle : await context.getObject<FAQArticle>();
        this.setActions();
        this.createLabels();

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

    private createLabels(): void {
        this.state.labels = this.state.faqArticle.Keywords.map(
            (k) => new Label(null, k, 'kix-icon-unknown', k, null, k)
        );
    }

}

module.exports = Component;
