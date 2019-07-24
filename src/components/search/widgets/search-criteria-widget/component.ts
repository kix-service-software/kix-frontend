/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    IKIXObjectSearchListener, LabelService, SearchOperatorUtil, WidgetService, ActionFactory
} from '../../../../core/browser';
import { KIXObject, SortUtil } from '../../../../core/model';
import { Label } from '../../../../core/browser/components';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';
class Component implements IKIXObjectSearchListener {

    public listenerId: string = 'search-criteria-widget';

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        SearchService.getInstance().registerListener(this);
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#New Search", "Translatable#Edit Search"
        ]);

        await this.prepareActions();

        this.searchFinished();
        this.state.loading = false;
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private async prepareActions(): Promise<void> {
        this.state.contentActions = await ActionFactory.getInstance().generateActions(
            ['edit-search-action', 'save-search-action', 'delete-search-action']
        );
        const actions = await ActionFactory.getInstance().generateActions(['new-search-action']);
        WidgetService.getInstance().registerActions(this.state.instanceId, actions);
    }

    public searchCleared(): void {
        this.searchFinished();
    }

    public async searchFinished(): Promise<void> {
        const cache = SearchService.getInstance().getSearchCache();
        const titleLabel = await TranslationService.translate('Translatable#Selected Search Criteria');
        this.state.displayCriteria = [];

        if (cache) {
            const searchDefinition = SearchService.getInstance().getSearchDefinition(cache.objectType);
            const labelProvider = LabelService.getInstance().getLabelProviderForType(cache.objectType);

            const searchLabel = await TranslationService.translate('Translatable#Search');
            if (cache.name) {
                this.state.title = `${titleLabel}: (${searchLabel}: ${cache.name})`;
            } else {
                const objectName = await labelProvider.getObjectName(true);
                this.state.title = `${titleLabel}: ${objectName}`;
            }
            const displayCriteria: Array<[string, string, Label[]]> = [];

            const parameter = [];
            for (const criteria of cache.criteria) {
                parameter.push([criteria.property, criteria.value]);
            }

            const properties = await SearchService.getInstance().getSearchProperties(
                cache.objectType, parameter
            );

            const criterias = cache.criteria.filter(
                (c) => typeof c.value !== 'undefined' && c.value !== null && c.value !== ''
            );
            for (const criteria of criterias) {
                const labels: Label[] = [];
                if (Array.isArray(criteria.value)) {
                    for (const v of criteria.value) {
                        const value = await searchDefinition.getDisplaySearchValue(
                            criteria.property, parameter, v, criteria.type
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
                        criteria.property, parameter, criteria.value, criteria.type
                    );
                    const icons = await labelProvider.getIcons(null, criteria.property, criteria.value);
                    labels.push(new Label(null, value, icons ? icons[0] : null, value, null, value, false));
                }

                const searchProperty = properties.find((p) => p[0] === criteria.property);
                let displayProperty = searchProperty[1];
                if (!displayProperty) {
                    displayProperty = await labelProvider.getPropertyText(criteria.property);
                } else {
                    displayProperty = await TranslationService.translate(displayProperty);
                }

                const label = await SearchOperatorUtil.getText(criteria.operator);
                displayCriteria.push([displayProperty, label, labels]);
            }
            setTimeout(() => this.state.displayCriteria = displayCriteria.sort(
                (a, b) => SortUtil.compareString(a[0], b[0])
            ), 100);
        } else {
            this.state.title = `${titleLabel}:`;
        }
    }

    public searchResultCategoryChanged(): void {
        return;
    }
}

module.exports = Component;
