import { KIXRouter } from '@kix/core/dist/routes/';
import {
    IAuthenticationService,
    IConfigurationService,
    IServerConfiguration,
    IRouter,
    IModuleFactoryExtension
} from '@kix/core';
import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';

export class ApplicationRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/";
    }

    public async getDefaultModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = this.configurationService.getServerConfiguration().DEFAULT_MODULE_ID;
        await this.handleModuleRequest(moduleId, res);
    }

    public async getModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = req.params.moduleId;

        if (moduleId === 'socket.io') {
            next();
            return;
        }

        await this.handleModuleRequest(moduleId, res);
    }


    public getRoot(req: Request, res: Response): void {
        const defaultRoute = this.configurationService.getServerConfiguration().DEFAULT_MODULE_ID;
        res.redirect(defaultRoute);
    }

    protected initialize(): void {
        this.router.get("/", this.getDefaultModule.bind(this));
        this.router.get("/:moduleId", this.getModule.bind(this));
    }

    private async handleModuleRequest(moduleId: string, res: Response): Promise<void> {
        const moduleFactory: IModuleFactoryExtension = await this.pluginService.getModuleFactory(moduleId);
        const template = moduleFactory.getTemplate();

        this.prepareMarkoTemplate(res, template, moduleFactory.getModuleId());
    }

}
