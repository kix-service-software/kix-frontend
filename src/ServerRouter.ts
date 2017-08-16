import { container } from './Container';
import { Application, Router } from 'express';
import { IApplicationRouter, IAuthenticationRouter } from './routes/';

export class ServerRouter {

    private router: Router;

    public constructor(application: Application) {
        this.router = Router();
        application.use(this.router);

        this.initializeRoutes();
    }

    private initializeRoutes(): void {

        // TODO: Request all router with the interface IRouter. Extend the interface for the base route path.
        const applicationRouter = container.get<IApplicationRouter>("IApplicationRouter");
        this.router.use("/", applicationRouter.router);

        const authenticationRouter = container.get<IAuthenticationRouter>("IAuthenticationRouter");
        this.router.use("/auth", authenticationRouter.router);
    }

}
