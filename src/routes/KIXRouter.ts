import { IMainMenuExtension, KIXExtensions } from './../extensions/';
import { injectable, inject } from 'inversify';
import { IServerConfiguration } from './../model';
import { IRouter } from './IRouter';
import { IConfigurationService, IAuthenticationService, IPluginService } from './../services/';
import { Router, Response } from 'express';

@injectable()
export abstract class KIXRouter implements IRouter {

    protected router: Router;
    protected configurationService: IConfigurationService;
    protected authenticationService: IAuthenticationService;
    protected pluginService: IPluginService;
    protected serverConfig: IServerConfiguration;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService,
        @inject("IPluginService") pluginService: IPluginService) {

        this.router = Router();
        this.configurationService = configurationService;
        this.authenticationService = authenticationService;
        this.pluginService = pluginService;
        this.serverConfig = configurationService.getServerConfiguration();
        this.initialize();
    }

    public getRouter(): Router {
        return this.router;
    }

    public abstract getBaseRoute(): string;

    protected abstract initialize(): void;

    protected async prepareMarkoTemplate(
        res: Response, contentTemplatePath: string, templateData?: any): Promise<void> {
        const appTemplatePath = '../components/app/index.marko';
        const baseTemplatePath = '../components/kix-base-template/index.marko';

        const template = require(appTemplatePath);

        res.marko(template, {
            template: require(baseTemplatePath),
            data: {
                frontendSocketUrl: this.getServerUrl(),
                contentTemplate: contentTemplatePath,
                templateData
            }
        });
    }

    protected getServerUrl(): string {
        return this.serverConfig.FRONTEND_URL + ":" + this.serverConfig.HTTPS_PORT;
    }

}
