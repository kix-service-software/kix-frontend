import { IRouter } from '@kix/core/dist/routes';
import { container } from './Container';
import { Application, Router, Request, Response } from 'express';

export class ServerRouter {

    private expressRouter: Router;

    public constructor(application: Application) {
        this.expressRouter = Router();

        application.use(this.expressRouter);

        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const registeredRouter = container.getDIContainer().getAll<IRouter>("IRouter");
        for (const router of registeredRouter) {
            this.expressRouter.use(router.getBaseRoute(), router.getRouter());

            router.setAppTemplate(require('./components/_app'));
            router.setBaseTemplate(require('./components/_base-template/index.marko'));
        }
    }
}
