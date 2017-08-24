import { IServerConfiguration } from './../model/';
import { IApplicationRouter } from './IApplicationRouter';
import { IAuthenticationService, IConfigurationService } from './../services/';
import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';

@injectable()
export class ApplicationRouter implements IApplicationRouter {

    public router: Router;
    public baseRoute = "/";
    private authenticationService: IAuthenticationService;
    private serverConfig: IServerConfiguration;

    constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService
    ) {
        this.serverConfig = configurationService.getServerConfiguration();
        this.authenticationService = authenticationService;
        this.router = Router();
        this.router.get("/", this.getRoot.bind(this));
    }

    public getRoot(req: Request, res: Response): void {
        const template = require('../components/app/index.marko');
        res.marko(template, {
            template: require('../components/kix-base-template/index.marko'),
            data: {
                frontendUrl: this.serverConfig.FRONTEND_URL
            }
        });
    }
}
