import { ComponentState } from './ComponentState';
import {
    ContextService, KIXObjectSearchService,
    IContextServiceListener, IKIXObjectSearchListener, LabelService, SearchOperatorUtil,
    KIXObjectServiceRegistry, StandardTableFactoryService, TableConfiguration
} from "@kix/core/dist/browser";
import {
    ContextMode, ContextType, ContextConfiguration,
    Context, KIXObject
} from "@kix/core/dist/model";
import { SearchContext } from '@kix/core/dist/browser/search';

class Component implements IContextServiceListener, IKIXObjectSearchListener {

    public listenerId: string;

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = 'kix-search-module-listener';
    }

    public onInput(input: any): void {
        this.state.fromHistory = input.fromHistory;
    }

    public onMount(): void {
        if (!this.state.fromHistory) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
        ContextService.getInstance().registerListener(this);
        KIXObjectSearchService.getInstance().registerListener(this);

        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            this.searchFinished();
        }
    }

    public contextChanged(
        contextId: string, context: Context<ContextConfiguration>, type: ContextType, fromHistory: boolean
    ): void {
        if (contextId === SearchContext.CONTEXT_ID && !fromHistory) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
    }

    public searchCleared(): void {
        this.state.criterias = [];
        this.state.resultTable = null;
    }

    public searchFinished<T extends KIXObject = KIXObject>(): void {
        this.state.resultTable = null;
        this.state.criterias = [];

        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            this.state.noSearch = false;
            const labelProvider = LabelService.getInstance().getLabelProviderForType(cache.objectType);
            const cachedCriterias = (cache ? cache.criterias : []);
            const newCriterias: Array<[string, string, string]> = [];
            cachedCriterias.forEach(
                (cc) => {
                    const property = labelProvider.getPropertyText(cc.property);
                    const operator = SearchOperatorUtil.getText(cc.operator);
                    const value = cc.value.toString();
                    newCriterias.push([property, operator, value]);
                }
            );
            this.state.criterias = newCriterias;

            this.state.resultIcon = labelProvider.getObjectIcon();
            this.state.resultTitle = `Trefferliste: ${labelProvider.getObjectName()} (${cache.result.length})`;

            const objectService = KIXObjectServiceRegistry.getInstance().getServiceInstance(cache.objectType);

            this.state.resultTable = StandardTableFactoryService.getInstance().createStandardTable(
                cache.objectType, null, null, null, true
            );

            const objectProperties = cache.criterias.map((c) => c.property);
            const columns = objectService.getTableColumnConfiguration(objectProperties);

            this.state.resultTable.setColumns(columns);
            this.state.resultTable.layerConfiguration.contentLayer.setPreloadedObjects(cache.result);
            this.state.resultTable.loadRows(false);
        } else {
            this.state.noSearch = true;
        }
    }
}

module.exports = Component;
