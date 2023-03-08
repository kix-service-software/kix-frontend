/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Application, Router } from 'express';
import { AuthenticationRouter } from './AuthenticationRouter';
import { ApplicationRouter } from './ApplicationRouter';
import { NotificationRouter } from './NotificationRouter';
import { PluginService } from '../../../../server/services/PluginService';
import { AgentPortalExtensions } from '../extensions/AgentPortalExtensions';
import { IServerRouterExtension } from '../extensions/IServerRouterExtension';
import { LoggingService } from '../../../../server/services/LoggingService';

export class ServerRouter {

    private expressRouter: Router;

    public constructor(application: Application) {
        this.expressRouter = Router();

        application.use(this.expressRouter);
    }

    public async initializeRoutes(): Promise<void> {
        await this.initExtensions();

        this.expressRouter.use(
            AuthenticationRouter.getInstance().getBaseRoute(), AuthenticationRouter.getInstance().getRouter()
        );

        this.expressRouter.use(
            ApplicationRouter.getInstance().getBaseRoute(), ApplicationRouter.getInstance().getRouter()
        );

        this.expressRouter.use(
            NotificationRouter.getInstance().getBaseRoute(), NotificationRouter.getInstance().getRouter()
        );
    }

    private async initExtensions(): Promise<void> {
        const routerExtensions = await PluginService.getInstance().getExtensions<IServerRouterExtension>(
            AgentPortalExtensions.ROUTER
        );

        LoggingService.getInstance().info(`Init ${routerExtensions.length} router extensions`);
        for (const extension of routerExtensions) {
            await extension.registerRouter(this.expressRouter);
        }
    }
}
