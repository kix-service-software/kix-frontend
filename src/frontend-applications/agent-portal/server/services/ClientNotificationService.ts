/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LoggingService } from '../../../../server/services/LoggingService';
import { BackendNotification } from '../../model/BackendNotification';
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
        setInterval(() => this.handleNotifications(), 2500);
    }

    private notificationsQueue: Map<number, BackendNotification[]> = new Map();
    private _events: BackendNotification[] = [];

    private notificationListener: Map<string, (events: BackendNotification[]) => void> = new Map();

    public getEvents(lastEventKey: number): { eventKey: number, notifications: BackendNotification[] } {
        const notifications: BackendNotification[] = [];
        let eventKey: number;
        this.notificationsQueue.forEach((value: BackendNotification[], key: number) => {
            if (!lastEventKey || key > lastEventKey) {
                notifications.push(...value);
                if (!eventKey || key > eventKey) {
                    eventKey = key;
                }

            }
        });
        return { eventKey, notifications };
    }

    public registerNotificationListener(id: string, listener: (events: BackendNotification[]) => void): void {
        this.notificationListener.set(id, listener);
    }

    public removeListener(id: string): void {
        this.notificationListener.delete(id);
    }

    public queueNotifications(objectEvents: BackendNotification[]): void {
        for (const event of objectEvents) {
            const hasEvent = this._events.some(
                (e) => e.Namespace === event.Namespace
                    && e.ObjectID === event.ObjectID
                    && e.UserID === event.UserID
            );

            if (!hasEvent) {
                this._events.push(event);
            }
        }

        CacheService.getInstance().updateCaches(objectEvents)
            .catch((error) => LoggingService.getInstance().error(error));
    }

    private handleNotifications(): void {
        const events = this._events.splice(0, this._events.length - 1);
        if (events?.length) {
            this.notificationsQueue.set(Date.now(), events);
        }
        this.cleanUpQueue();
    }

    private cleanUpQueue(): void {
        const keysToDelete = [];
        const currentDate = Date.now();
        this.notificationsQueue.forEach((value: BackendNotification[], key: number) => {
            if (currentDate - key > 10000) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach((k) => this.notificationsQueue.delete(k));
    }

}