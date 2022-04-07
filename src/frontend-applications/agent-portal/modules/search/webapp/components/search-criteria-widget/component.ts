/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { SearchService } from '../../core/SearchService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { SearchEvent } from '../../../model/SearchEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { SearchContext } from '../../core';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';

class Component {

    public listenerId: string = 'search-criteria-widget';

    private state: ComponentState;
    private subscriber: IEventSubscriber;
    private managerListenerId: string;
    private contextInstanceId: string;

    private keyListenerElement: any;
    private keyListener: any;

    private valueChangedTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Attributes', 'Translatable#Reset data', 'Translatable#Cancel',
            'Translatable#Detailed search results', 'Translatable#Start search',
            'Translatable#New Search', 'Translatable#Edit Search'
        ]);

        await this.prepareActions();

        WidgetService.getInstance().updateActions(this.state.instanceId);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('search-criteria-widget'),
            eventPublished: (data: SearchContext, eventId: string): void => {
                if (data.instanceId === this.contextInstanceId) {
                    if (eventId === SearchEvent.SEARCH_DELETED || eventId === SearchEvent.SEARCH_CACHE_CHANGED) {
                        this.initManager();
                    }
                    this.setTitle();
                }
            }
        };

        EventService.getInstance().subscribe(SearchEvent.SAVE_SEARCH_FINISHED, this.subscriber);
        EventService.getInstance().subscribe(SearchEvent.SEARCH_DELETED, this.subscriber);
        EventService.getInstance().subscribe(SearchEvent.SEARCH_CACHE_CHANGED, this.subscriber);

        this.keyListenerElement = (this as any).getEl('search-criteria-container');
        if (this.keyListenerElement) {
            this.keyListener = this.keyDown.bind(this);
            this.keyListenerElement.addEventListener('keydown', this.keyListener);
        }

        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        this.contextInstanceId = context?.instanceId;
        const searchDefinition = SearchService.getInstance().getSearchDefinition(
            context.descriptor.kixObjectTypes[0]
        );
        this.state.manager = searchDefinition?.formManager;
        this.setTitle();
        this.initManager();

        this.managerListenerId = IdService.generateDateBasedId('search-criteria-widget');
        this.state.manager?.registerListener(this.managerListenerId, async () => {
            if (this.valueChangedTimeout) {
                window.clearTimeout(this.valueChangedTimeout);
            }

            this.valueChangedTimeout = setTimeout(() => {
                const values = this.state.manager.getValues();
                this.state.canSearch = values.length > 0;

                const criteria: FilterCriteria[] = [];
                for (const v of values) {
                    criteria.push(searchDefinition.getFilterCriteria(v));
                }

                context?.getSearchCache()?.setCriteria(criteria);
            }, 100);
        });
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(SearchEvent.SAVE_SEARCH_FINISHED, this.subscriber);
        EventService.getInstance().unsubscribe(SearchEvent.SEARCH_DELETED, this.subscriber);
        EventService.getInstance().unsubscribe(SearchEvent.SEARCH_CACHE_CHANGED, this.subscriber);

        this.state.manager?.unregisterListener(this.managerListenerId);

        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.keyListener);
        }
    }

    private async initManager(): Promise<void> {
        this.state.manager?.reset();

        const context = ContextService.getInstance().getContext<SearchContext>(this.contextInstanceId);
        const cache = context?.getSearchCache();

        this.state.limit = cache?.limit;

        if (this.state.manager && Array.isArray(cache?.criteria) && cache?.criteria.length) {
            for (const criteria of cache.criteria) {
                this.state.manager?.setValue(
                    new ObjectPropertyValue(criteria.property, criteria.operator, criteria.value)
                );
            }
        } else {
            await this.setDefaults();
        }

        const dynamicFormComponent = (this as any).getComponent('search-criteria-dynamic-form');
        if (dynamicFormComponent) {
            dynamicFormComponent.updateValues();
        }
    }

    private async prepareActions(): Promise<void> {
        this.state.contentActions = await ActionFactory.getInstance().generateActions(
            ['save-search-action', 'delete-search-action']
        );
    }

    public async search(): Promise<void> {
        const hint = await TranslationService.translate('Translatable#Search');
        BrowserUtil.toggleLoadingShield('SEARCH_CRITERIA_SHIELD', true, hint);
        const context = ContextService.getInstance().getContext<SearchContext>(this.contextInstanceId);
        await SearchService.getInstance().searchObjects(context?.getSearchCache());
        BrowserUtil.toggleLoadingShield('SEARCH_CRITERIA_SHIELD', false);
    }

    public limitChanged(event: any): void {
        this.state.limit = event.target.value;
        const context = ContextService.getInstance().getContext<SearchContext>(this.contextInstanceId);
        const searchCache = context?.getSearchCache();
        if (searchCache) {
            searchCache.limit = this.state.limit;
        }
    }

    public resetSearch(): void {
        const context = ContextService.getInstance().getContext<SearchContext>(this.contextInstanceId);
        context.resetSearch();
    }

    private async setTitle(): Promise<void> {
        const context = ContextService.getInstance().getContext<SearchContext>(this.contextInstanceId);
        const cache = context?.getSearchCache();

        const titleLabel = await TranslationService.translate('Translatable#Selected Search Criteria');
        const searchLabel = await TranslationService.translate('Translatable#Search');
        if (cache.name) {
            this.state.title = `${titleLabel}: (${searchLabel}: ${cache.name})`;
        } else {
            const objectName = await LabelService.getInstance().getObjectName(cache.objectType, true);
            this.state.title = `${titleLabel}: ${objectName}`;
        }
    }

    private async setDefaults(): Promise<void> {
        const context = ContextService.getInstance().getContext<SearchContext>(this.contextInstanceId);
        const cache = context?.getSearchCache();
        const searchDefinition = SearchService.getInstance().getSearchDefinition(cache?.objectType);
        const criteria = searchDefinition.getDefaultSearchCriteria();
        if (Array.isArray(criteria)) {
            for (const p of criteria) {
                const operators = await this.state.manager.getOperations(p);
                this.state.manager.setValue(new ObjectPropertyValue(p, operators ? operators[0] : null, null));
            }
        }
    }

    public keyDown(event: any): void {
        if ((event.ctrlKey && event.key === 'Enter') && this.state.canSearch) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            this.search();
        }
    }

}

module.exports = Component;
