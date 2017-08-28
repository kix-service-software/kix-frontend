import { KIXRouter } from './KIXRouter';
import { IRouter } from './IRouter';
import { IServerConfiguration } from './../model/';
import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthenticationService, IConfigurationService } from './../services/';

export class AuthenticationRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/auth";
    }

    public login(req: Request, res: Response): void {
        const template = require('../components/app/index.marko');
        res.marko(template, {
            template: require('../components/login/index.marko'),
            data: {
                frontendSocketUrl: this.serverConfig.FRONTEND_SOCKET_URL
            }
        });
    }

    protected initialize(): void {
        this.router.get("/", this.login.bind(this));
    }

}
