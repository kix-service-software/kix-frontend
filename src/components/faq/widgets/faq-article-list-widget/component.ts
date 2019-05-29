import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, SearchOperator, WidgetService, ServiceRegistry, TableFactoryService
} from '../../../../core/browser';
import { KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, KIXObject } from '../../../../core/model';
import { FAQArticleProperty, FAQCategory } from '../../../../core/model/kix/faq';
import { FAQContext } from '../../../../core/browser/faq';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;

    private predefinedFilter: KIXObjectPropertyFilter;
    private textFilterValue: string;
    private additionalFilterCriteria: TableFilterCriteria[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.additionalFilterCriteria = [];
        const context = await ContextService.getInstance().getContext<FAQContext>(FAQContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration.contextDependent) {
            context.registerListener('faq-article-list-context-listener', {
                explorerBarToggled: () => { return; },
                sidebarToggled: () => { return; },
                objectChanged: () => { return; },
                objectListChanged: this.contextObjectListChanged.bind(this),
                filteredObjectListChanged: () => { return; },
                scrollInformationChanged: () => { return; }
            });
        }

        await this.prepareFilter();
        this.prepareActions();
        await this.prepareTable();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async contextObjectListChanged(objectList: KIXObject[]): Promise<void> {
        if (this.state.table) {
            this.setTitle(objectList.length);
            this.setActionsDirty();
        }
    }

    private async prepareFilter(): Promise<void> {
        const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION
        );
        const languages = await translationService.getLanguages();
        this.state.predefinedTableFilter = languages.map(
            (l) => new KIXObjectPropertyFilter(
                l[1], [new TableFilterCriteria(FAQArticleProperty.LANGUAGE, SearchOperator.EQUALS, l[0])]
            )
        );
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'faq-articles', KIXObjectType.FAQ_ARTICLE, null, null, FAQContext.CONTEXT_ID
        );

        this.state.table = table;

        const context = await ContextService.getInstance().getContext<FAQContext>(FAQContext.CONTEXT_ID);
        this.setCategoryFilter(context.faqCategory);
        if (this.state.widgetConfiguration.contextDependent && context) {
            const objects = await context.getObjectList();
            this.setTitle(objects.length);
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private setTitle(count: number = 0): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
        if (this.state.table) {
            title = `${title} (${count})`;
        }
        this.state.title = title;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const name = this.predefinedFilter ? this.predefinedFilter.name : null;
            const predefinedCriteria = this.predefinedFilter ? this.predefinedFilter.criteria : [];
            const newFilter = [...predefinedCriteria, ...this.additionalFilterCriteria];

            this.state.table.setFilter(textFilterValue, newFilter);
            this.state.table.filter();
        }
    }

    private setCategoryFilter(category: FAQCategory): void {
        this.additionalFilterCriteria = [];

        if (category) {
            this.additionalFilterCriteria = [
                new TableFilterCriteria(FAQArticleProperty.CATEGORY_ID, SearchOperator.EQUALS, category.ID)
            ];
        }

        if (!this.predefinedFilter) {
            this.predefinedFilter = new KIXObjectPropertyFilter('FAQ Kategorie', []);
        }

        this.filter(this.textFilterValue, this.predefinedFilter);
    }

}

module.exports = Component;
