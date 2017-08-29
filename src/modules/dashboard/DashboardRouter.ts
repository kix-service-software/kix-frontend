import { injectable, inject } from 'inversify';
import { Router, Request, Response } from 'express';
import { KIXRouter } from '../../routes';

export class DashboardRouter extends KIXRouter {

    public getBaseRoute(): string {
        return "/dashboard";
    }

    protected initialize(): void {
        this.router.get("/", this.getDashboard.bind(this));
    }

    private getDashboard(req: Request, res: Response): void {
        this.prepareMarkoTemplate(res, 'dashboard/index.marko');
    }

}
