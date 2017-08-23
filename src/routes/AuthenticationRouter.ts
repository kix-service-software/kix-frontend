import { IServerConfiguration } from './../model/';
import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthenticationService, IConfigurationService } from './../services/';
import { IAuthenticationRouter } from './IAuthenticationRouter';

@injectable()
export class AuthenticationRouter implements IAuthenticationRouter {

    public router: Router;
    public baseRoute = "/auth";
    private authenticationService: IAuthenticationService;
    private serverConfig: IServerConfiguration;

    constructor(
        @inject("IConfigurationService") configurationService: IConfigurationService,
        @inject("IAuthenticationService") authenticationService: IAuthenticationService
    ) {
        this.serverConfig = configurationService.getServerConfiguration();
        this.authenticationService = authenticationService;
        this.router = Router();
        this.router.get("/", this.login.bind(this));
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
}
