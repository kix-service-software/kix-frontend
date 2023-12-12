/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ServerManager } from '../../../../server/ServerManager';
import { LoggingService } from '../../../../server/services/LoggingService';
import { BackendNotification } from '../../model/BackendNotification';
import { NotificationEvent } from '../../model/NotificationEvent';
import { CacheService } from './cache';
import { RedisCache } from './cache/RedisCache';

export class ClientNotificationService {

    private static INSTANCE: ClientNotificationService;

    public static getInstance(): ClientNotificationService {
        if (!ClientNotificationService.INSTANCE) {
            ClientNotificationService.INSTANCE = new ClientNotificationService();
        }
        return ClientNotificationService.INSTANCE;
    }

    private constructor() {
        RedisCache.getInstance().subscribe('KIXFrontendNotify', this.queueNotifications.bind(this));
    }

    private notificationTimeout: any;
    private notificationsQueue: BackendNotification[] = [];

    private notificationListener: Array<(events: BackendNotification[]) => void> = [];

    public registerNotificationListener(listener: (events: BackendNotification[]) => void): void {
        this.notificationListener.push(listener);
    }

    public queueNotifications(objectEvents: BackendNotification[]): void {
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        for (const event of objectEvents) {
            const hasEvent = this.notificationsQueue.some((e) => e.Namespace === event.Namespace);
            if (!hasEvent) {
                this.notificationsQueue.push(event);
            }
        }

        this.notificationTimeout = setTimeout(() => this.handleNotifications(), 500);
    }

    private async handleNotifications(): Promise<void> {
        await CacheService.getInstance().updateCaches(this.notificationsQueue)
            .catch((error) => LoggingService.getInstance().error(error));

        const servers = ServerManager.getInstance().getServers();
        for (const server of servers) {
            server?.getSocketService()?.broadcast(NotificationEvent.UPDATE_EVENTS, this.notificationsQueue);
        }

        this.notificationListener.forEach((l) => l(this.notificationsQueue));
        this.notificationsQueue = [];
    }

}