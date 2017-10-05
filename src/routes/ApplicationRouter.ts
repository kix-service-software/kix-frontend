import { KIXRouter } from '@kix/core/dist/routes/';
import {
    IAuthenticationService,
    IConfigurationService,
    IServerConfiguration,
    IRouter,
    IModuleFactoryExtension,
    ISpecificCSSExtension,
    KIXExtensions
} from '@kix/core';
import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';

export class ApplicationRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/";
    }

    public async getDefaultModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = this.configurationService.getServerConfiguration().DEFAULT_MODULE_ID;
        await this.handleModuleRequest(moduleId, req, res, next);
    }

    public async getModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = req.params.moduleId;

        if (moduleId === 'socket.io') {
            next();
            return;
        }

        await this.handleModuleRequest(moduleId, req, res, next);
    }


    public getRoot(req: Request, res: Response): void {
        const defaultRoute = this.configurationService.getServerConfiguration().DEFAULT_MODULE_ID;
        res.redirect(defaultRoute);
    }

    protected initialize(): void {
        this.router.get(
            "/",
            this.authenticationService.isAuthenticated.bind(this.authenticationService),
            this.getDefaultModule.bind(this)
        );

        this.router.get(
            "/:moduleId",
            this.authenticationService.isAuthenticated.bind(this.authenticationService),
            this.getModule.bind(this)
        );
    }

    private async handleModuleRequest(moduleId: string, req: Request, res: Response, next: () => void): Promise<void> {
        const moduleFactory: IModuleFactoryExtension = await this.pluginService.getModuleFactory(moduleId);
        if (moduleFactory) {

            const token: string = req.cookies.token;
            const user = await this.userService.getUserByToken(token);

            const template = moduleFactory.getTemplate();
            const themeCSS = await this.getUserThemeCSS(user.UserID);
            const specificCSS = await this.getSpecificCSS();
            this.prepareMarkoTemplate(res, template, moduleFactory.getModuleId(), themeCSS, specificCSS);
        } else {
            next();
        }
    }

    private async getUserThemeCSS(userId: number): Promise<string> {
        // TODO: define context id for personal settings.
        const configuration =
            await this.configurationService.getComponentConfiguration("personal-settings", null, null, userId);

        if (configuration) {
            return configuration.theme;
        }

        return null;
    }

    private async getSpecificCSS(): Promise<string[]> {
        const cssExtensions = await this.pluginService.getExtensions<ISpecificCSSExtension>(KIXExtensions.SPECIFIC_CSS);
        let specificCSS = [];

        for (const extension of cssExtensions) {
            specificCSS = specificCSS.concat(extension.getSpecificCSSPaths());
        }

        return specificCSS;
    }

}
