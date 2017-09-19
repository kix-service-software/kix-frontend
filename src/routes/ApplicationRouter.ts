import { KIXRouter } from './KIXRouter';
import { IAuthenticationService, IConfigurationService, IServerConfiguration, IRouter } from '@kix/core';
import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';

export class ApplicationRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/";
    }

    public getRoot(req: Request, res: Response): void {
        const defaultRoute = this.configurationService.getServerConfiguration().DEFAULT_ROUTE;
        res.redirect(defaultRoute);
    }

    protected initialize(): void {
        this.router.get("/", this.getRoot.bind(this));
    }

}
