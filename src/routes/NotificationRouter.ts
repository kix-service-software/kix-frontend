import { Request, Response } from 'express';
import { LoggingService, AuthenticationService } from '../core/services';
import { KIXRouter } from './KIXRouter';
import { SocketService } from '../services';
import { ObjectUpdatedEvent, ObjectUpdatedEventData } from '../core/model';
import { CacheService } from '../core/cache';

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
        return "/notifications";
    }

    protected initialize(): void {
        this.router.post(
            "/",
            AuthenticationService.getInstance().isCallbackAuthenticated.bind(AuthenticationService.getInstance()),
            this.handleRequest.bind(this));
    }

    private async handleRequest(req: Request, res: Response): Promise<void> {
        if (Array.isArray(req.body)) {
            const objectEvents: ObjectUpdatedEventData[] = req.body;
            await CacheService.getInstance().updateCaches(objectEvents);
            SocketService.getInstance().broadcast(objectEvents);
        }

        res.status(201).send();
    }


}
