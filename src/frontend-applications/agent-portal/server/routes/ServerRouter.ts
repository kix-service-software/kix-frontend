/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Application, Router } from 'express';
import { AuthenticationRouter } from './AuthenticationRouter';
import { ApplicationRouter } from './ApplicationRouter';
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
        const baseRoute = '/';

        const extentionRouter = await this.initExtensions();

        this.expressRouter.use(baseRoute, [
            Router().use(
                AuthenticationRouter.getInstance().getBaseRoute(),
                AuthenticationRouter.getInstance().getRouter()
            ),
            ...extentionRouter,
            ApplicationRouter.getInstance().getRouter()
        ]);
    }

    private async initExtensions(): Promise<Router[]> {
        const routerExtensions = await PluginService.getInstance().getExtensions<IServerRouterExtension>(
            AgentPortalExtensions.ROUTER
        );

        const router = [];
        LoggingService.getInstance().info(`Init ${routerExtensions.length} router extensions`);
        for (const extension of routerExtensions) {
            const r = await extension.registerRouter();
            router.push(r);
        }

        return router;
    }
}
