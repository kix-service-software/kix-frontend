import { IMainMenuExtension, KIXExtensions } from './../extensions/';
import { injectable, inject } from 'inversify';
import { IServerConfiguration, BaseTemplateInput } from './../model';
import { IRouter } from './IRouter';
import { IConfigurationService, IAuthenticationService, IPluginService, IUserService } from './../services/';
import { Router, Response, Request } from 'express';

@injectable()
export abstract class KIXRouter implements IRouter {

    protected router: Router;
    protected configurationService: IConfigurationService;
    protected authenticationService: IAuthenticationService;
    protected pluginService: IPluginService;
    protected userService: IUserService;
    protected serverConfig: IServerConfiguration;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService,
        @inject("IPluginService") pluginService: IPluginService,
        @inject("IUserService") userService: IUserService) {

        this.router = Router();
        this.configurationService = configurationService;
        this.authenticationService = authenticationService;
        this.pluginService = pluginService;
        this.userService = userService;

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
            data: new BaseTemplateInput(this.getServerUrl(), contentTemplatePath, templateData)
        });
    }

    protected getServerUrl(): string {
        return this.serverConfig.FRONTEND_URL + ":" + this.serverConfig.HTTPS_PORT;
    }

    protected async getUserId(req: Request): Promise<number> {
        const token = req.cookies.token;
        const user = await this.userService.getUserByToken(token);
        return user.UserID;
    }

    protected setContextId(contextId: string, res: Response): void {
        res.cookie('contextId', contextId);
    }

    protected setFrontendSocketUrl(res: Response): void {
        res.cookie('frontendSocketUrl', this.getServerUrl());
    }
}
