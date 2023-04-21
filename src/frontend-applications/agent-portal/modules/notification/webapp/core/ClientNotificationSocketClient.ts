/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../../../../modules/base-components/webapp/core/SocketClient';
import { NotificationEvent } from '../../../../model/NotificationEvent';
import { BackendNotification } from '../../../../model/BackendNotification';
import { ClientStorageService } from '../../../../modules/base-components/webapp/core/ClientStorageService';
import { NotificationHandler } from '../../../../modules/base-components/webapp/core/NotificationHandler';
import { FormService } from '../../../../modules/base-components/webapp/core/FormService';
import { BrowserCacheService } from '../../../../modules/base-components/webapp/core/CacheService';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class ClientNotificationSocketClient extends SocketClient {

    private static INSTANCE: ClientNotificationSocketClient = null;

    public static getInstance(): ClientNotificationSocketClient {
        if (!ClientNotificationSocketClient.INSTANCE) {
            ClientNotificationSocketClient.INSTANCE = new ClientNotificationSocketClient();
        }

        return ClientNotificationSocketClient.INSTANCE;
    }

    public constructor() {
        super('notifications');

        this.socket.on(
            NotificationEvent.UPDATE_EVENTS, async (events: BackendNotification[]) => {
                events = events.map((e) => new BackendNotification(e));
                BrowserCacheService.getInstance().updateCaches(events);

                // check if we need to clear the current user cache to update the toolbar data
                if (events.some((e) => e.Namespace.startsWith('Ticket'))) {
                    await AgentSocketClient.getInstance().clearCurrentUserCache();
                    BrowserCacheService.getInstance().deleteKeys(`${KIXObjectType.CURRENT_USER}_STATS`);
                }

                events = events
                    .filter((e) => e.RequestID !== ClientStorageService.getClientRequestId())
                    .filter((e) => e.Namespace !== 'Ticket.Article.Flag')
                    .filter((e) => e.Namespace !== 'Ticket.Watcher')
                    .filter((e) => e.Namespace !== 'Ticket.History');
                NotificationHandler.handleUpdateNotifications(events);
            });

        this.socket.on(
            NotificationEvent.UPDATE_FORMS, (clientRequestId: string) => {
                if (clientRequestId !== ClientStorageService.getClientRequestId()) {
                    FormService.getInstance().loadFormConfigurations();
                }
            });
    }

}
