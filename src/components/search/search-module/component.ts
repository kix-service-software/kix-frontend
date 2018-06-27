import { ComponentState } from './ComponentState';
import {
    ContextService, KIXObjectSearchService,
    IContextServiceListener, IKIXObjectSearchListener, LabelService, SearchOperatorUtil
} from "@kix/core/dist/browser";
import {
    ContextMode, ContextType, ContextConfiguration,
    Context, FilterCriteria, KIXObject
} from "@kix/core/dist/model";
import { SearchContext } from '@kix/core/dist/browser/search';

class Component implements IContextServiceListener, IKIXObjectSearchListener {

    public listenerId: string = 'kix-search-module-listener';

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
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
    }

    public contextChanged(
        contextId: string, context: Context<ContextConfiguration>, type: ContextType, fromHistory: boolean
    ): void {
        if (contextId === SearchContext.CONTEXT_ID && !fromHistory) {
            ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
        }
    }

    public openNewSearchDialog(): void {
        KIXObjectSearchService.getInstance().clearSearchCache();
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }

    public openEditSearchDialog(): void {
        ContextService.getInstance().setDialogContext(null, null, ContextMode.SEARCH);
    }

    public searchCleared(): void {
        this.state.criterias = [];
    }

    public searchFinished<T extends KIXObject = KIXObject>(result: T[]): void {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
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
    }


}

module.exports = Component;
