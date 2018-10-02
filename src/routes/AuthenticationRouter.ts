import { Request, Response } from 'express';

import { KIXRouter, IRouter } from '@kix/core/dist/routes';
import { ReleaseInfo } from '@kix/core/dist/model';

export class AuthenticationRouter extends KIXRouter {

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
            (await this.configurationService.getModuleConfiguration('release-info', null) as ReleaseInfo);

        res.marko(template, {
            login: true,
            logout,
            releaseInfo
        });
    }

    protected initialize(): void {
        this.router.get("/", this.login.bind(this));
    }

}
