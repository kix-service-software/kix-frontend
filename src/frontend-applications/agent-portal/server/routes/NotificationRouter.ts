/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from './KIXRouter';
import { AuthenticationService } from '../services/AuthenticationService';
import { CacheService } from '../services/cache';
import { NotificationEvent } from '../../model/NotificationEvent';
import { ObjectUpdatedEventData } from '../../model/ObjectUpdatedEventData';
import { SocketService } from '../services/SocketService';

export class NotificationRouter extends KIXRouter {

    private static INSTANCE: NotificationRouter;

    public static getInstance(): NotificationRouter {
        if (!NotificationRouter.INSTANCE) {
            NotificationRouter.INSTANCE = new NotificationRouter();
        }
        return NotificationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/notifications';
    }

    protected initialize(): void {
        this.router.post(
            '/',
            AuthenticationService.getInstance().isCallbackAuthenticated.bind(AuthenticationService.getInstance()),
            this.handleRequest.bind(this));
    }

    private async handleRequest(req: Request, res: Response): Promise<void> {
        if (Array.isArray(req.body)) {
            const objectEvents: ObjectUpdatedEventData[] = req.body;
            await CacheService.getInstance().updateCaches(objectEvents);
            SocketService.getInstance().broadcast(NotificationEvent.UPDATE_EVENTS, objectEvents);
        }

        res.status(201).send();
    }


}
