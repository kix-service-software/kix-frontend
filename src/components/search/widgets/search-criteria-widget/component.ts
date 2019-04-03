import { ComponentState } from './ComponentState';
import {
    IKIXObjectSearchListener, KIXObjectSearchService,
    LabelService, ContextService, SearchOperatorUtil
} from '../../../../core/browser';
import { KIXObject, ContextMode, CacheState } from '../../../../core/model';
import { Label } from '../../../../core/browser/components';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
class Component implements IKIXObjectSearchListener {

    public listenerId: string = 'search-criteria-widget';

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        KIXObjectSearchService.getInstance().registerListener(this);
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#New Search", "Translatable#Edit Search"
        ]);
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
        const titleLabel = await TranslationService.translate('Translatable#Selected Search Criteria');
        if (cache) {
            const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(cache.objectType);
            const labelProvider = LabelService.getInstance().getLabelProviderForType(cache.objectType);
            const objectName = await labelProvider.getObjectName(true);
            this.state.title = `${titleLabel}: ${objectName}`;
            const displayCriteria: Array<[string, string, Label[]]> = [];

            const parameter = [];
            for (const criteria of cache.criteria) {
                parameter.push([criteria.property, criteria.value]);
            }

            const properties = await KIXObjectSearchService.getInstance().getSearchProperties(
                cache.objectType, parameter
            );

            for (const criteria of cache.criteria) {
                const labels: Label[] = [];
                if (Array.isArray(criteria.value)) {
                    for (const v of criteria.value) {
                        const value = await searchDefinition.getDisplaySearchValue(
                            criteria.property, parameter, v
                        );
                        const icons = await labelProvider.getIcons(null, criteria.property, v);
                        labels.push(new Label(null, value, icons ? icons[0] : null, value, null, value, false));
                    }
                } else if (criteria.value instanceof KIXObject) {
                    labels.push(new Label(
                        null, criteria.property, null, criteria.value.toString(),
                        null, criteria.value.toString(), false
                    ));
                } else {
                    const value = await searchDefinition.getDisplaySearchValue(
                        criteria.property, parameter, criteria.value
                    );
                    const icons = await labelProvider.getIcons(null, criteria.property, criteria.value);
                    labels.push(new Label(null, value, icons ? icons[0] : null, value, null, value, false));
                }

                const searchProperty = properties.find((p) => p[0] === criteria.property);
                let displayProperty = searchProperty[1];
                if (!displayProperty) {
                    displayProperty = await labelProvider.getPropertyText(criteria.property);
                }

                const label = await SearchOperatorUtil.getText(criteria.operator);
                displayCriteria.push([displayProperty, label, labels]);
            }
            setTimeout(() => this.state.displayCriteria = displayCriteria, 100);
        } else {
            this.state.title = `${titleLabel}:`;
        }
    }

    public searchResultCategoryChanged(): void {
        return;
    }
}

module.exports = Component;
