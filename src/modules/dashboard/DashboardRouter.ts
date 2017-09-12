import { injectable, inject } from 'inversify';
import { Router, Request, Response } from 'express';
import { KIXRouter } from '../../routes';

export class DashboardRouter extends KIXRouter {

    private CONTEXT_ID = "dashboard";

    public getBaseRoute(): string {
        return "/dashboard";
    }

    protected initialize(): void {
        this.router.get("/", this.authenticationService.isAuthenticated.bind(this.authenticationService),
            this.getDashboard.bind(this));
    }

    private async getDashboard(req: Request, res: Response): Promise<void> {
        const token = await this.getToken(req);

        const user = await this.userService.getUserByToken(token);
        const userId = user && user.UserID;

        const config = await this.configurationService.getComponentConfiguration(this.CONTEXT_ID, null, userId)
            .catch(async (error) => {
                const moduleFactory = await this.pluginService.getModuleFactory(this.CONTEXT_ID);
                const moduleDefaultConfiguration = moduleFactory.getDefaultConfiguration();

                await this.configurationService.saveComponentConfiguration(
                    this.CONTEXT_ID, null, userId, moduleDefaultConfiguration);

                return moduleDefaultConfiguration;
            });

        this.setContextId(this.CONTEXT_ID, res);
        this.setFrontendSocketUrl(res);
        this.prepareMarkoTemplate(res, 'dashboard/index.marko', config);
    }

}
