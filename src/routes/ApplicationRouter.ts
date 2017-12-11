import { KIXRouter } from '@kix/core/dist/routes/';
import { IAuthenticationService, IConfigurationService } from '@kix/core/dist/services';

import { IServerConfiguration } from '@kix/core/dist/common';
import { IRouter } from '@kix/core/dist/routes';
import { IModuleFactoryExtension, ISpecificCSSExtension, KIXExtensions } from '@kix/core/dist/extensions';

import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';

export class ApplicationRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/";
    }

    public async getDefaultModule(req: Request, res: Response, next: () => void): Promise<void> {
        const moduleId = this.configurationService.getServerConfiguration().DEFAULT_MODULE_ID;
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

        this.router.get(
            "/:moduleId/:objectId",
            this.authenticationService.isAuthenticated.bind(this.authenticationService),
            this.getModule.bind(this)
        );
    }

    private async handleRoute(moduleId: string, objectId: string, req: Request, res: Response): Promise<void> {
        const token: string = req.cookies.token;
        const user = await this.userService.getUserByToken(token);

        const themeCSS = await this.getUserThemeCSS(user.UserID);
        const specificCSS = await this.getSpecificCSS();

        const tagLib = await this.markoService.getComponentTags();

        this.prepareMarkoTemplate(res, moduleId, objectId, themeCSS, specificCSS, tagLib);
    }

    private async getUserThemeCSS(userId: number): Promise<string> {
        // TODO: define context id for personal settings.
        const configuration =
            await this.configurationService.getComponentConfiguration("personal-settings", null, userId);

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
