import { ComponentState } from './ComponentState';
import {
    IKIXObjectSearchListener, KIXObjectSearchService,
    LabelService, ContextService, SearchOperatorUtil, SearchOperator
} from '@kix/core/dist/browser';
import { KIXObject, ContextMode, CacheState } from '@kix/core/dist/model';
class Component implements IKIXObjectSearchListener {

    public listenerId: string = 'search-criteria-widget';

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        KIXObjectSearchService.getInstance().registerListener(this);
        this.searchFinished();
    }

    public openNewSearchDialog(): void {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        const objectType = cache ? cache.objectType : null;

        if (cache) {
            cache.status = CacheState.INVALID;
        }

        ContextService.getInstance().setDialogContext(null, objectType, ContextMode.SEARCH);
    }

    public openEditSearchDialog(): void {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.VALID;
            ContextService.getInstance().setDialogContext(null, cache.objectType, ContextMode.SEARCH);
        }
    }

    public searchCleared(): void {
        this.state.displayCriteria = [];
    }

    public async searchFinished(): Promise<void> {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(cache.objectType);
            this.state.title = `Gewählte Suchkriterien: ${labelProvider.getObjectName(true)}`;
            const displayCriteria = [];
            if (cache.isFulltext && cache.fulltextValue) {
                displayCriteria.push([
                    "Volltext", SearchOperatorUtil.getText(SearchOperator.CONTAINS), cache.fulltextValue
                ]);
            } else {
                for (const criteria of cache.criteria) {
                    let displayValue;
                    if (Array.isArray(criteria.value)) {
                        const valueStrings = [];
                        for (const v of criteria.value) {
                            const value = await labelProvider.getPropertyValueDisplayText(criteria.property, v);
                            valueStrings.push(value);
                        }
                        displayValue = valueStrings.join(', ');
                    } else if (criteria.value instanceof KIXObject) {
                        displayValue = criteria.value.toString();
                    } else {
                        displayValue = await labelProvider.getPropertyValueDisplayText(
                            criteria.property, criteria.value
                        );
                    }

                    const displayProperty = await labelProvider.getPropertyText(criteria.property);
                    displayCriteria.push([
                        displayProperty, SearchOperatorUtil.getText(criteria.operator), displayValue
                    ]);
                }
            }
            setTimeout(() => this.state.displayCriteria = displayCriteria, 100);
        } else {
            this.state.title = "Gewählte Suchkriterien:";
        }
    }

    public searchResultCategoryChanged(): void {
        return;
    }
}

module.exports = Component;
