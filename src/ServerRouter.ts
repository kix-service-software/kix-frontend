import { IRouter } from '@kix/core/dist/routes';
import { Application, Router, Request, Response } from 'express';
import { ServiceContainer } from '@kix/core/dist/common';

export class ServerRouter {

    private expressRouter: Router;

    public constructor(application: Application) {
        this.expressRouter = Router();

        application.use(this.expressRouter);

        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const registeredRouter = ServiceContainer.getInstance().getClasses<IRouter>("IRouter");
        for (const router of registeredRouter) {
            this.expressRouter.use(router.getBaseRoute(), router.getRouter());

            router.setAppTemplate(require('./components/_app'));
        }
    }
}
