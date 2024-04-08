/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { KIXObjectSocketClient } from '../../../../base-components/webapp/core/KIXObjectSocketClient';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { SearchEvent } from '../../../model/SearchEvent';
import { SearchContext } from '../../core';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: SearchContext;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext<SearchContext>();
        const searchCache = this.context?.getSearchCache();

        await this.initContentWidgets();
        await this.setTitle(searchCache.objectType);

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (context: Context): void => {
                if (context.instanceId === this.context?.instanceId) {
                    this.setTitle(searchCache.objectType);
                }
            }
        };

        EventService.getInstance().subscribe(SearchEvent.SEARCH_CACHE_CHANGED, this.subscriber);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(SearchEvent.SEARCH_CACHE_CHANGED, this.subscriber);
    }

    private async initContentWidgets(): Promise<void> {
        this.state.contentWidgets = await this.context?.getContent();
    }

    private async setTitle(objectType: KIXObjectType | string): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(objectType, true);
        let title = await TranslationService.translate('Translatable#Search Results: {0}', [objectName]);

        const resultCount = KIXObjectSocketClient.getInstance().getCollectionsCount(
            this.context.getCollectionId()
        ) || 0;
        const currentCount = KIXObjectSocketClient.getInstance().getCollectionsLimit(
            this.context.getCollectionId()
        ) || 0;
        title += ` (${currentCount}/${resultCount})`;
        this.state.title = title;
    }
}

module.exports = Component;
