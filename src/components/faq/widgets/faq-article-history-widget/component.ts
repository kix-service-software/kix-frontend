import { ComponentState } from "./ComponentState";
import { ContextService, ActionFactory, StandardTableFactoryService, IdService } from "../../../../core/browser";
import { KIXObjectType, Context } from "../../../../core/model";
import { FAQArticle } from "../../../../core/model/kix/faq";
import { FAQDetailsContext } from "../../../../core/browser/faq";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<FAQDetailsContext>(FAQDetailsContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('faq-history-widget', {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(faqArticle);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(await context.getObject<FAQArticle>());

    }

    private async initWidget(faqArticle?: FAQArticle): Promise<void> {
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
                this.state.widgetConfiguration.actions, [this.state.faqArticle]
            );
        }
    }

    private prepareTable(): void {
        const table = StandardTableFactoryService.getInstance().createStandardTable(KIXObjectType.FAQ_ARTICLE_HISTORY);

        if (table) {
            table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.faqArticle.History);
            table.loadRows();

            this.state.standardTable = table;
            this.state.standardTable.setTableListener(() => {
                this.state.filterCount = this.state.standardTable.getTableRows(true).length || 0;
                (this as any).setStateDirty('filterCount');
            });
        }
    }

    public filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        if (this.state.standardTable) {
            this.state.standardTable.setFilterSettings(filterValue);
        }
    }

}

module.exports = Component;
