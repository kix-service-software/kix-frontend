import { ContextService } from '../../../../core/browser/context';
import { ComponentState } from './ComponentState';
import { ActionFactory, TableFactoryService } from '../../../../core/browser';
import { KIXObjectType } from '../../../../core/model';
import { FAQArticle } from '../../../../core/model/kix/faq';
import { FAQDetailsContext } from '../../../../core/browser/faq';

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
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(faqArticle);
                }
            }
        });

        await this.initWidget(await context.getObject<FAQArticle>());

    }

    private async initWidget(faqArticle: FAQArticle): Promise<void> {
        if (faqArticle) {
            this.prepareActions(faqArticle);
            await this.prepareTable();
        }
    }

    private async prepareActions(faqArticle: FAQArticle): Promise<void> {
        if (this.state.widgetConfiguration && faqArticle) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [faqArticle]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'faq-article-history', KIXObjectType.FAQ_ARTICLE_HISTORY, null, null, FAQDetailsContext.CONTEXT_ID
        );

        this.state.table = table;
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

}

module.exports = Component;
