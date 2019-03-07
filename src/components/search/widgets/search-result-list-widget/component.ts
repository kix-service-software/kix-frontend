import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, KIXObject, KIXObjectType, } from '../../../../core/model/';
import { ContextService } from "../../../../core/browser/context";
import {
    ActionFactory, KIXObjectSearchService, IKIXObjectSearchListener,
    LabelService, WidgetService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchResultCategory,
    KIXObjectSearchCache, KIXObjectService, SearchProperty, TableFactoryService, TableEvent, TableEventData
} from '../../../../core/browser';
import { SearchContext } from '../../../../core/browser/search/context';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';

class Component implements IKIXObjectSearchListener {

    public listenerId: string;
    public eventSubscriberId: string;

    private tableSubscriber: IEventSubscriber;

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerId = this.state.instanceId;
        this.eventSubscriberId = this.state.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;


        this.setActions();

        KIXObjectSearchService.getInstance().registerListener(this);
        this.searchFinished();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
    }

    public searchCleared(): void {
        this.state.table = null;
        this.searchResultCategoryChanged(null);
    }

    public searchFinished<T extends KIXObject = KIXObject>(): void {
        this.state.table = null;

        setTimeout(() => {
            const cache = KIXObjectSearchService.getInstance().getSearchCache();
            if (cache) {
                this.state.noSearch = false;
                const category = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
                this.initWidget(category ? category.objectType : cache.objectType, cache);
            } else {
                this.state.noSearch = true;
            }
        }, 100);
    }

    private async initWidget(
        objectType: KIXObjectType,
        cache: KIXObjectSearchCache<KIXObject> = KIXObjectSearchService.getInstance().getSearchCache()
    ): Promise<void> {
        if (objectType) {
            this.state.loading = true;
            this.state.table = null;

            const isSearchMainObject = cache.objectType === objectType;

            let resultCount: number = 0;

            if (isSearchMainObject) {
                resultCount = cache.result.length;
                KIXObjectSearchService.getInstance().provideResult(null);
            } else {
                const activeCategory = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
                if (activeCategory) {
                    resultCount = activeCategory ? activeCategory.objectIds.length : 0;
                    const resultObjects = await KIXObjectService.loadObjects(
                        objectType, [...activeCategory.objectIds]
                    );
                    KIXObjectSearchService.getInstance().provideResult(resultObjects);
                }
            }

            const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
            this.state.resultIcon = labelProvider.getObjectIcon();
            this.state.resultTitle = `Trefferliste ${labelProvider.getObjectName(true)} (${resultCount})`;

            let emptyResultHint;
            if (!cache) {
                emptyResultHint = 'Keine Suche ausgeführt.';
            }

            const tableConfiguration = new TableConfiguration(
                objectType, null, null, null, null, true, null, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL, emptyResultHint
            );
            const table = TableFactoryService.getInstance().createTable(
                `search-result-list-${objectType}`, objectType, tableConfiguration,
                null, SearchContext.CONTEXT_ID, true, true, true
            );



            this.tableSubscriber = {
                eventSubscriberId: 'search-result-table-listener',
                eventPublished: async (data: TableEventData, eventId: string) => {
                    if (data && data.tableId === table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED && isSearchMainObject) {
                            const parameter: Array<[string, any]> = [];
                            for (const c of cache.criteria) {
                                if (c.property !== SearchProperty.FULLTEXT) {
                                    parameter.push([c.property, c.value]);
                                }
                            }
                            const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(
                                objectType
                            );
                            const columns = await searchDefinition.getTableColumnConfiguration(parameter);
                            table.addColumns(columns);
                        }
                        if (eventId === TableEvent.TABLE_READY) {
                            this.state.filterCount = this.state.table.isFiltered()
                                ? this.state.table.getRowCount()
                                : null;
                        }
                    }
                }
            };

            EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
            EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);

            WidgetService.getInstance().setActionData(this.state.instanceId, table);
            this.state.table = table;
            this.setActionsDirty();
        } else {
            this.state.resultIcon = null;
            this.state.resultTitle = 'Trefferliste';
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.actions);
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.state.table.setFilter(textFilterValue, filter ? filter.criteria : null);
            this.state.table.filter();
        }
    }

    public async searchResultCategoryChanged(category: SearchResultCategory): Promise<void> {
        await this.initWidget(category ? category.objectType : null);
    }

}

module.exports = Component;
