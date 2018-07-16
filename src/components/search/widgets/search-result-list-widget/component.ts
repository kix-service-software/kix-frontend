import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, KIXObject, KIXObjectType, ContextMode, } from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    ActionFactory, KIXObjectSearchService, IKIXObjectSearchListener,
    LabelService, StandardTableFactoryService, WidgetService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchResultCategory, KIXObjectSearchCache
} from '@kix/core/dist/browser';
import { KIXObjectServiceRegistry } from '@kix/core/dist/browser';

class Component implements IKIXObjectSearchListener {

    public listenerId: string;

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerId = this.state.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;


        this.setActions();

        KIXObjectSearchService.getInstance().registerListener(this);
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            this.searchFinished();
        }
    }

    public searchCleared(): void {
        this.state.resultTable = null;
    }

    public searchFinished<T extends KIXObject = KIXObject>(): void {
        this.state.resultTable = null;

        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            this.state.noSearch = false;
            this.initWidget(cache.objectType, cache);
        } else {
            this.state.noSearch = true;
        }
    }

    private async initWidget(
        objectType: KIXObjectType,
        cache: KIXObjectSearchCache<KIXObject> = KIXObjectSearchService.getInstance().getSearchCache()
    ): Promise<void> {
        if (objectType) {
            this.state.loading = true;
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
                    resultObjects = await ContextService.getInstance().loadObjects(
                        objectType, activeCategory.objectIds
                    );
                }
            }

            const labelProvider = LabelService.getInstance().getLabelProviderForType(objectType);
            this.state.resultIcon = labelProvider.getObjectIcon();
            this.state.resultTitle = `Trefferliste: ${labelProvider.getObjectName(true)} (${resultCount})`;

            const tableConfiguration = new TableConfiguration(
                null, 10, null, null, true, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            this.state.resultTable = StandardTableFactoryService.getInstance().createStandardTable(
                objectType, tableConfiguration, null, null, true, true
            );

            this.state.resultTable.layerConfiguration.contentLayer.setPreloadedObjects(resultObjects);
            this.state.resultTable.loadRows();
            if (isSearchMainObject) {
                const objectProperties = cache.criterias.map((c) => c.property);
                const objectService = KIXObjectServiceRegistry.getInstance().getServiceInstance(objectType);
                const columns = objectService.getTableColumnConfiguration(objectProperties);
                this.state.resultTable.setColumns(columns);
            }

            this.state.resultTable.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

            WidgetService.getInstance().setActionData(this.state.instanceId, this.state.resultTable);

            this.state.loading = false;
            (this as any).setStateDirty('loading');
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.actions, true);
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.resultTable) {
            this.state.resultTable.setFilterSettings(textFilterValue, filter);
        }
    }

    public async searchResultCategoryChanged(category: SearchResultCategory): Promise<void> {
        await this.initWidget(category.objectType);
    }
}

module.exports = Component;
