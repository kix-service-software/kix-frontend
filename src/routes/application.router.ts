import { Router, Request, Response } from 'express';

export class ApplicationRouter {

    public router: Router;

    constructor() {
        this.router = Router();
        this.router.get("/", this.getRoot.bind(this));
    }

    private getRoot(req: Request, res: Response): void {
        const template = require('../components/app/index.marko');
        res.marko(template, {});
    }

}