import { Request, Response } from 'express';

import { KIXRouter, IRouter } from '@kix/core/dist/routes';

export class AuthenticationRouter extends KIXRouter {

    public getContextId(): string {
        return "authentication";
    }

    public getBaseRoute(): string {
        return "/auth";
    }

    public login(req: Request, res: Response): void {
        const template = require('../components/_login-app/');
        this.setFrontendSocketUrl(res);

        const logout = req.query.logout !== undefined;

        res.marko(template, {
            login: true,
            data: {
                frontendSocketUrl: this.getServerUrl(),
                logout
            }
        });
    }

    protected initialize(): void {
        this.router.get("/", this.login.bind(this));
    }

}
