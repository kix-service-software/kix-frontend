/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Application, Router } from 'express';
import { ApplicationRouter, AuthenticationRouter } from './routes';
import { NotificationRouter } from './routes/NotificationRouter';

export class ServerRouter {

    private expressRouter: Router;

    public constructor(application: Application) {
        this.expressRouter = Router();

        application.use(this.expressRouter);

        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.expressRouter.use(
            AuthenticationRouter.getInstance().getBaseRoute(), AuthenticationRouter.getInstance().getRouter()
        );
        AuthenticationRouter.getInstance().setAppTemplate(require('./components/_app'));

        this.expressRouter.use(
            ApplicationRouter.getInstance().getBaseRoute(), ApplicationRouter.getInstance().getRouter()
        );
        ApplicationRouter.getInstance().setAppTemplate(require('./components/_app'));

        this.expressRouter.use(
            NotificationRouter.getInstance().getBaseRoute(), NotificationRouter.getInstance().getRouter()
        );
    }
}
