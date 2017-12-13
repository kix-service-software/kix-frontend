import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { KIXRouter, IRouter } from '@kix/core/dist/routes';
import { IServerConfiguration } from '@kix/core/dist/common';
import { IAuthenticationService, IConfigurationService } from '@kix/core/dist/services';

export class AuthenticationRouter extends KIXRouter {

    public getContextId(): string {
        return "authentication";
    }

    public getBaseRoute(): string {
        return "/auth";
    }

    public login(req: Request, res: Response): void {
        const template = require('../components/_app/');
        this.setFrontendSocketUrl(res);

        const logout = req.query.logout !== undefined;

        res.marko(template, {
            template: require('../components/login/'),
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
