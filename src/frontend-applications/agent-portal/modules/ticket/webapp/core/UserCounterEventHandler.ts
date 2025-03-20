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
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';

export class UserCounterEventHandler {

    private static INSTANCE: UserCounterEventHandler;

    public static getInstance(): UserCounterEventHandler {
        if (!UserCounterEventHandler.INSTANCE) {
            UserCounterEventHandler.INSTANCE = new UserCounterEventHandler();
        }
        return UserCounterEventHandler.INSTANCE;
    }

    private subscriber: IEventSubscriber;

    private constructor() {

        this.subscriber = {
            eventSubscriberId: 'TicketStatsEventHandler',
            eventPublished: (data: BackendNotification): void => {
                if (data instanceof BackendNotification && data.Namespace === 'User.Counters') {
                    const userId = AgentSocketClient.getInstance().userId;
                    if (!data.UserID || data.UserID?.toString() === userId?.toString()) {
                        this.updateCurrentUserCache();
                    }
                }
            }
        };

        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
    }

    public async updateCurrentUserCache(): Promise<void> {
        BrowserCacheService.getInstance().deleteKeys(`${KIXObjectType.USER_TICKETS}`);
        BrowserCacheService.getInstance().deleteKeys(`${KIXObjectType.USER_COUNTER}`);
        EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
    }

}