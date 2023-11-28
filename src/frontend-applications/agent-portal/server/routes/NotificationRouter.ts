/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from './KIXRouter';
import { AuthenticationService } from '../../../../server/services/AuthenticationService';
import { CacheService } from '../services/cache';
import { NotificationEvent } from '../../model/NotificationEvent';
import { BackendNotification } from '../../model/BackendNotification';
import { SocketService } from '../services/SocketService';
import { LoggingService } from '../../../../server/services/LoggingService';
import { ServerManager } from '../../../../server/ServerManager';
import { NotificationNamespace } from '../socket-namespaces/NotificationNamespace';

export class NotificationRouter extends KIXRouter {

    private static INSTANCE: NotificationRouter;

    public static getInstance(): NotificationRouter {
        if (!NotificationRouter.INSTANCE) {
            NotificationRouter.INSTANCE = new NotificationRouter();
        }
        return NotificationRouter.INSTANCE;
    }

    private notificationTimeout: any;
    private notificationsQueue: BackendNotification[] = [];

    private constructor() {
        super();
    }

    private notificationListener: Array<(events: BackendNotification[]) => void> = [];

    public getBaseRoute(): string {
        return '/notifications';
    }

    protected initialize(): void {
        this.router.post(
            '/',
            AuthenticationService.getInstance().isCallbackAuthenticated.bind(AuthenticationService.getInstance()),
            this.handleRequest.bind(this));
    }

    public registerNotificationListener(listener: (events: BackendNotification[]) => void): void {
        this.notificationListener.push(listener);
    }

    private async handleRequest(req: Request, res: Response): Promise<void> {
        if (Array.isArray(req.body)) {
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
            }

            const objectEvents: BackendNotification[] = req.body;
            for (const event of objectEvents) {
                const hasEvent = this.notificationsQueue.some((e) => e.Namespace === event.Namespace);
                if (!hasEvent) {
                    this.notificationsQueue.push(event);
                }
            }

            this.notificationTimeout = setTimeout(() => this.handleNotifications(), 500);
        }

        res.status(201).send();
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
