/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { Context } from '../../../../../model/Context';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
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

        this.state.icon = LabelService.getInstance().getObjectIconForType(searchCache.objectType);
        await this.setTitle(searchCache.objectType);

        const widgetConfiguration = new WidgetConfiguration(
            'search-result-widget-' + searchCache.name, searchCache.name, ConfigurationType.TableWidget,
            'table-widget', searchCache.name, ['bulk-action', 'csv-export-action'], null,
            new TableWidgetConfiguration('', '', null, searchCache.objectType),
            false, false, this.state.icon, true
        );

        this.state.instanceId = this.context.getTableId(searchCache.objectType);
        this.state.objectType = searchCache.objectType;
        this.state.configuration = widgetConfiguration;

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(),
            eventPublished: (context: Context): void => {
                if (context.instanceId === this.context?.instanceId) {
                    this.setTitle();
                }
            }
        };

        EventService.getInstance().subscribe(SearchEvent.SEARCH_CACHE_CHANGED, this.subscriber);

        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(SearchEvent.SEARCH_CACHE_CHANGED, this.subscriber);
    }

    private async setTitle(objectType: KIXObjectType | string = this.state.objectType): Promise<void> {
        const objectName = await LabelService.getInstance().getObjectName(objectType, true);
        let title = await TranslationService.translate('Translatable#Search Results: {0}', [objectName]);

        const resultCount = this.context?.getSearchCache()?.result?.length || 0;
        title += ` (${resultCount})`;
        this.state.title = title;
    }
}

module.exports = Component;
