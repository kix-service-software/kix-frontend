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
