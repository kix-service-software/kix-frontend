/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextMode } from '../../../../../../model/ContextMode';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ContextEvents } from '../../../../../base-components/webapp/core/ContextEvents';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { ElasticSearchContext } from '../../../../../search/webapp/core/ElasticSearchContext';
import { ElasticSearchService } from '../../../../../search/webapp/core/ElasticSearchService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Create', 'Translatable#Search'
        ]);

        const descriptors = ContextService.getInstance().getContextDescriptors(ContextMode.SEARCH);
        this.state.canShow = Array.isArray(descriptors) && descriptors.length > 0;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
    }

    public async searchClicked(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        this.search();
    }

    public searchInputClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.search();
        }
    }

    public async search(): Promise<void> {
        const element = (this as any).getEl('searchObjectInput');
        if (element?.value) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.query.push(['pattern', element?.value]);
            loadingOptions.query.push(['searchengine', 'elastic']);
            const result = await ElasticSearchService.getInstance().loadObjects(
                KIXObjectType.ELASTIC_SEARCH, null, loadingOptions
            );
            const additionalInformation: Array<[string, any]> = [['searchresult', result]];
            ContextService.getInstance().setActiveContext(
                ElasticSearchContext.CONTEXT_ID, null, null, additionalInformation
            );
        }
    }

    public searchValueChanged(event: any, externalFilterText?: string): void {
        this.state.searchValue = event ? event.target.value : externalFilterText;
    }

}

module.exports = Component;
