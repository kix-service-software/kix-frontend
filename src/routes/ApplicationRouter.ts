import { ISpecificCSSExtension, KIXExtensions } from '../core/extensions';
import { Request, Response } from 'express';
import { ConfigurationService, AuthenticationService } from '../core/services';
import { KIXRouter } from './KIXRouter';
import { PluginService } from '../services';
import { UserService } from '../core/services/impl/api/UserService';

export class ApplicationRouter extends KIXRouter {

    private static INSTANCE: ApplicationRouter;

    public static getInstance(): ApplicationRouter {
        if (!ApplicationRouter.INSTANCE) {
            ApplicationRouter.INSTANCE = new ApplicationRouter();
        }
        return ApplicationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return "/";
    }

    public async getDefaultModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = ConfigurationService.getInstance().getServerConfiguration().DEFAULT_MODULE_ID;
        await this.handleRoute(moduleId, null, req, res);
    }

    public async getModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = req.params.moduleId;
        const objectId = req.params.objectId;

        if (moduleId === 'socket.io') {
            next();
            return;
        }

        await this.handleRoute(moduleId, objectId, req, res);
    }


    public getRoot(req: Request, res: Response): void {
        const defaultRoute = ConfigurationService.getInstance().getServerConfiguration().DEFAULT_MODULE_ID;
        res.redirect(defaultRoute);
    }

    protected initialize(): void {
        this.router.get(
            "/",
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getDefaultModule.bind(this)
        );

        this.router.get(
            "/:moduleId",
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getModule.bind(this)
        );

        this.router.get(
            "/:moduleId/:objectId",
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getModule.bind(this)
        );

        this.router.get(
            "/:moduleId/:objectId/*",
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getModule.bind(this)
        );
    }

    private async handleRoute(moduleId: string, objectId: string, req: Request, res: Response): Promise<void> {
        const token: string = req.cookies.token;
        this.prepareMarkoTemplate(res, moduleId, objectId);
    }

}
