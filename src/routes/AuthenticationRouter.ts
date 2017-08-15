import { Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthenticationService } from './../services/';
import { IAuthenticationRouter } from './IAuthenticationRouter';

@injectable()
export class AuthenticationRouter implements IAuthenticationRouter {

    public router: any;

    private authenticationService: IAuthenticationService;

    constructor( @inject("IAuthenticationService") authenticationService: IAuthenticationService) {
        this.authenticationService = authenticationService;
        this.router = Router();
        this.router.get("/", this.login.bind(this));
    }

    public login(req: Request, res: Response): void {
        const template = require('../components/login/index.marko');
        res.marko(template, {});
    }
}
