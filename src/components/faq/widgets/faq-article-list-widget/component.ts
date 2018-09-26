import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, StandardTableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchOperator, WidgetService, LanguageUtil
} from "@kix/core/dist/browser";
import { KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria, KIXObject } from "@kix/core/dist/model";
import { FAQArticleProperty, FAQCategory } from "@kix/core/dist/model/kix/faq";
import { FAQContext } from "@kix/core/dist/browser/faq";

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
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('faq-article-list-context-listener', {
            explorerBarToggled: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: this.contextObjectChanged.bind(this),
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.prepareFilter();
        this.prepareActions();
        this.prepareTable();

        this.state.loading = false;
    }

    private async prepareFilter(): Promise<void> {
        const languages = await LanguageUtil.getLanguages();
        this.state.predefinedTableFilter = languages.map(
            (l) => new KIXObjectPropertyFilter(
                l[1], [new TableFilterCriteria(FAQArticleProperty.LANGUAGE, SearchOperator.EQUALS, l[0])]
            )
        );
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private prepareTable(): void {
        const tableConfiguration = new TableConfiguration(
            null, 25, null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );

        const table =
            StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.FAQ_ARTICLE, tableConfiguration, null, null, true
            );

        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        table.setTableListener(() => {
            this.state.title = this.getTitle();
        });

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        table.layerConfiguration.contentLayer.setPreloadedObjects(null);
        this.state.table = table;

        const context = ContextService.getInstance().getActiveContext();
        if (context.getDescriptor().contextId === FAQContext.CONTEXT_ID) {
            this.setCategoryFilter((context as FAQContext).currentFAQCategory);
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private getTitle(): string {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${this.state.table.getTableRows(true).length})`;
        }
        return title;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const name = this.predefinedFilter ? this.predefinedFilter.name : null;
            const predefinedCriteria = this.predefinedFilter ? this.predefinedFilter.criteria : [];
            const newFilter = new KIXObjectPropertyFilter(
                name, [...predefinedCriteria, ...this.additionalFilterCriteria]
            );

            this.state.table.setFilterSettings(textFilterValue, newFilter);
        }
    }

    private contextObjectChanged(objectId: string | number, object: KIXObject, type: KIXObjectType): void {
        if (type === KIXObjectType.FAQ_CATEGORY) {
            this.setCategoryFilter((object as FAQCategory));
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
