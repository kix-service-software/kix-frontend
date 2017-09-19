import { KIXRouter } from './KIXRouter';
import { IRouter, IServerConfiguration } from '@kix/core';
import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthenticationService, IConfigurationService } from '@kix/core';

export class AuthenticationRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/auth";
    }

    public login(req: Request, res: Response): void {
        const template = require('../components/app/index.marko');
        this.setFrontendSocketUrl(res);
        res.marko(template, {
            template: require('../components/login/index.marko'),
            data: {
                frontendSocketUrl: this.getServerUrl()
            }
        });
    }

    protected initialize(): void {
        this.router.get("/", this.login.bind(this));
    }

}
