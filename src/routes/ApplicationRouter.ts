import { IApplicationRouter } from './IApplicationRouter';
import { IAuthenticationService } from './../services/IAuthenticationService';
import { inject, injectable } from 'inversify';
import { Request, Response, Router } from 'express';

@injectable()
export class ApplicationRouter implements IApplicationRouter {

    public router: Router;

    private authenticationService: IAuthenticationService;

    constructor( @inject("IAuthenticationService") authenticationService: IAuthenticationService) {
        this.authenticationService = authenticationService;
        this.router = Router();
        this.router.get("/", this.authenticationService.isAuthenticated.bind(this), this.getRoot.bind(this));
    }

    public getRoot(req: Request, res: Response): void {
        const template = require('../components/app/index.marko');
        res.marko(template, {});
    }

}
