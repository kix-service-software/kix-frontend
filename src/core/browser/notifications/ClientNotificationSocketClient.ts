/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketClient } from '../SocketClient';
import { NotificationEvent, ObjectUpdatedEventData } from '../../model';
import { CacheService } from '../cache';
import { ClientStorageService } from '../ClientStorageService';
import { ContextService } from '../context';

export class ClientNotificationSocketClient extends SocketClient {

    private notificationsSocket: SocketIO.Server;

    private static INSTANCE: ClientNotificationSocketClient = null;

    public static getInstance(): ClientNotificationSocketClient {
        if (!ClientNotificationSocketClient.INSTANCE) {
            ClientNotificationSocketClient.INSTANCE = new ClientNotificationSocketClient();
        }

        return ClientNotificationSocketClient.INSTANCE;
    }

    public constructor() {
        super();
        this.notificationsSocket = this.createSocket('notifications');

        this.notificationsSocket.on(
            NotificationEvent.MESSAGE, (events: ObjectUpdatedEventData[]) => {
                CacheService.getInstance().updateCaches(events);
                events = events.filter((e) => e.RequestID !== ClientStorageService.getClientRequestId());
                ContextService.getInstance().handleUpdateNotifications(events);
            });
    }

}
