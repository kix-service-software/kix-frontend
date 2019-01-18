import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, KIXObject, KIXObjectType, } from '../../../../core/model/';
import { ContextService } from "../../../../core/browser/context";
import {
    ActionFactory, KIXObjectSearchService, IKIXObjectSearchListener,
    LabelService, StandardTableFactoryService, WidgetService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchResultCategory,
    KIXObjectSearchCache, KIXObjectService, SearchProperty, TableEvents, TableEventData
} from '../../../../core/browser';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';

class Component implements IKIXObjectSearchListener, IEventSubscriber {

    public listenerId: string;
    public eventSubscriberId: string;

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
        EventService.getInstance().subscribe(TableEvents.REFRESH, this);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvents.REFRESH, this);
    }

    public searchCleared(): void {
        this.state.resultTable = null;
        this.searchResultCategoryChanged(null);
    }

    public searchFinished<T extends KIXObject = KIXObject>(): void {
        this.state.resultTable = null;

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
            this.state.resultTable = null;

            const isSearchMainObject = cache.objectType === objectType;

            let resultCount: number = 0;
            let resultObjects: KIXObject[] = [];

            if (isSearchMainObject) {
                resultCount = cache.result.length;
                resultObjects = cache.result;
            } else {
                const activeCategory = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
                if (activeCategory) {
                    resultCount = activeCategory ? activeCategory.objectIds.length : 0;
                    resultObjects = await KIXObjectService.loadObjects(
                        objectType, [...activeCategory.objectIds]
                    );
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
                null, null, null, null, true, null, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.SMALL, emptyResultHint
            );
            const table = StandardTableFactoryService.getInstance().createStandardTable(
                objectType, tableConfiguration, null, null, true, true
            );

            table.layerConfiguration.contentLayer.setPreloadedObjects(resultObjects);

            if (isSearchMainObject) {
                const parameter: Array<[string, any]> = [];
                for (const c of cache.criteria) {
                    if (c.property !== SearchProperty.FULLTEXT) {
                        parameter.push([c.property, c.value]);
                    }
                }
                const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(objectType);
                const columns = await searchDefinition.getTableColumnConfiguration(parameter);
                table.setColumns(columns);
            }

            await table.loadRows();

            table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

            WidgetService.getInstance().setActionData(this.state.instanceId, table);

            setTimeout(() => {
                this.state.tableId = 'Search-Table-' + cache.objectType;
                this.state.resultTable = table;

                this.state.resultTable.setTableListener(() => {
                    this.state.filterCount = this.state.resultTable.getTableRows(true).length || 0;
                    (this as any).setStateDirty('filterCount');
                });
                this.state.loading = false;
            }, 500);
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
        if (this.state.resultTable) {
            this.state.resultTable.setFilterSettings(textFilterValue, filter);
        }
    }

    public async searchResultCategoryChanged(category: SearchResultCategory): Promise<void> {
        await this.initWidget(category ? category.objectType : null);
    }

    public async eventPublished(data: TableEventData, eventId: string): Promise<void> {
        if (data && data.tableId === this.state.resultTable.tableId && eventId === TableEvents.REFRESH) {
            // FIXME: sollte über ein Table-Refresh möglich sein, direkt über Tabelle, nicht über einbindendes Widget
            await this.refreshTable();
        }
    }

    private async refreshTable(): Promise<void> {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        const category = KIXObjectSearchService.getInstance().getActiveSearchResultExplorerCategory();
        let objectIds = [];
        if (cache.objectType === category.objectType) {
            objectIds = cache.result.map((o) => o.ObjectId);
        } else {
            objectIds = category.objectIds;
        }
        if (objectIds && !!objectIds.length) {
            const objects = await KIXObjectService.loadObjects(
                category.objectType, objectIds, null, null, false
            );
            this.state.resultTable.layerConfiguration.contentLayer.setPreloadedObjects(objects);
            await this.state.resultTable.loadRows(true);
        }

    }
}

module.exports = Component;
