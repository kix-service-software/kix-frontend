/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BackendNotification } from '../../../../model/BackendNotification';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { SearchService } from '../../../search/webapp/core/SearchService';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { IdService } from '../../../../model/IdService';

export class UserPreferencesEventHandler {

    private static INSTANCE: UserPreferencesEventHandler;

    public static getInstance(): UserPreferencesEventHandler {
        if (!UserPreferencesEventHandler.INSTANCE) {
            UserPreferencesEventHandler.INSTANCE = new UserPreferencesEventHandler();
        }
        return UserPreferencesEventHandler.INSTANCE;
    }

    private readonly subscriber: IEventSubscriber;

    private constructor() {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('UserPreferencesEventHandler'),
            eventPublished: function (data: BackendNotification): void {
                if (data instanceof BackendNotification && data.Namespace === 'User.UserPreference') {
                    const userId = AgentSocketClient.getInstance().userId;
                    const objectIds = data.ObjectID?.split('::') || [];
                    if (objectIds?.length && objectIds[0].toString() === userId?.toString()) {
                        this.updateCurrentUserCache(data);
                    }
                }
            }.bind(this)
        };
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
    }

    public async updateCurrentUserCache(notification: BackendNotification): Promise<void> {
        BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);

        if (notification.ObjectID?.indexOf('searchprofiles') !== -1) {
            SearchService.getInstance().getSearchBookmarks(true);
        }
    }

}