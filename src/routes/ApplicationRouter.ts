import { IAuthenticationService } from './../services/IAuthenticationService';
import { Request, Response, Router } from 'express';

export class ApplicationRouter {

    public router: Router;

    private authenticationService: IAuthenticationService;

    constructor(authenticationService: IAuthenticationService) {
        this.authenticationService = authenticationService;
        this.router = Router();
        this.router.get("/", this.getRoot.bind(this));
    }

    private getRoot(req: Request, res: Response): void {
        const template = require('../components/app/index.marko');
        res.marko(template, {});
    }

}
