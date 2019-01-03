import { Request, Response } from 'express';

import { ReleaseInfo } from '../core/model';
import { ConfigurationService } from '../core/services';
import { KIXRouter } from './KIXRouter';

export class AuthenticationRouter extends KIXRouter {

    private static INSTANCE: AuthenticationRouter;

    public static getInstance(): AuthenticationRouter {
        if (!AuthenticationRouter.INSTANCE) {
            AuthenticationRouter.INSTANCE = new AuthenticationRouter();
        }
        return AuthenticationRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected initialize(): void {
        this.router.get("/", this.login.bind(this));
    }

    public getContextId(): string {
        return "authentication";
    }

    public getBaseRoute(): string {
        return "/auth";
    }

    public async login(req: Request, res: Response): Promise<void> {
        const template = require('../components/_login-app/');
        this.setFrontendSocketUrl(res);

        const logout = req.query.logout !== undefined;

        const releaseInfo =
            (await ConfigurationService.getInstance().getModuleConfiguration('release-info', null) as ReleaseInfo);

        res.marko(template, {
            login: true,
            logout,
            releaseInfo
        });
    }

}
