import { injectable, inject } from 'inversify';
import { IServerConfiguration } from './../model';
import { IRouter } from './IRouter';
import { IConfigurationService, IAuthenticationService } from './../services/';
import { Router, Response } from 'express';

@injectable()
export abstract class KIXRouter implements IRouter {

    protected router: Router;
    protected configurationService: IConfigurationService;
    protected authenticationService: IAuthenticationService;
    protected serverConfig: IServerConfiguration;

    public constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService) {

        this.router = Router();
        this.configurationService = configurationService;
        this.authenticationService = authenticationService;
        this.serverConfig = configurationService.getServerConfiguration();
        this.initialize();
    }

    public getRouter(): Router {
        return this.router;
    }

    public abstract getBaseRoute(): string;

    protected abstract initialize(): void;

    protected prepareMarkoTemplate(res: Response, contentTemplatePath: string): void {
        const appTemplatePath = '../components/app/index.marko';
        const baseTemplatePath = '../components/kix-base-template/index.marko';

        const template = require(appTemplatePath);

        res.marko(template, {
            template: require(baseTemplatePath),
            data: {
                frontendUrl: this.serverConfig.FRONTEND_URL,
                frontendSocketUrl: this.getSocketUrl(),
                contentTemplate: contentTemplatePath
            }
        });
    }

    private getSocketUrl(): string {
        return this.serverConfig.FRONTEND_SOCKET_URL + ":" + this.serverConfig.SOCKET_COMMUNICATION_PORT;
    }

}
