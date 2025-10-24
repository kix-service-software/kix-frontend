/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BackendNotification } from '../../../../model/BackendNotification';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { SearchService } from './SearchService';
import { IdService } from '../../../../model/IdService';

export class SharedSearchEventHandler {

    private static INSTANCE: SharedSearchEventHandler;

    public static getInstance(): SharedSearchEventHandler {
        if (!SharedSearchEventHandler.INSTANCE) {
            SharedSearchEventHandler.INSTANCE = new SharedSearchEventHandler();
        }
        return SharedSearchEventHandler.INSTANCE;
    }

    private readonly subscriber: IEventSubscriber;

    private constructor() {

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('SharedSearchEventHandler'),
            eventPublished: function (data: BackendNotification): void {
                if (data instanceof BackendNotification && data.Namespace === 'Search.Shared') {
                    if (data.ObjectID === 'SharedSearch') {
                        SearchService.getInstance().getSearchBookmarks(true);
                    }
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
    }

}