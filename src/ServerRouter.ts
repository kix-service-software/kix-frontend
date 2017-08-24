import { IRouter } from './routes/';
import { container } from './Container';
import { Application, Router, Request, Response } from 'express';

export class ServerRouter {

    private router: Router;

    public constructor(application: Application) {
        this.router = Router();

        application.use(this.router);

        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const registeredRouter = container.getAll<IRouter>("IRouter");
        for (const router of registeredRouter) {
            this.router.use(router.baseRoute, router.router);
        }
    }
}
