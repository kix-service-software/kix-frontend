import { Router, Request, Response } from 'express';
import { KIXRouter } from '../../routes';

export class DashboardRouter extends KIXRouter {

    private CONTEXT_ID = "dashboard";

    public getBaseRoute(): string {
        return "/dashboard";
    }

    protected initialize(): void {
        this.router.get("/", this.authenticationService.isAuthenticated.bind(this.authenticationService),
            this.getDashboard.bind(this));
    }

    private async getDashboard(req: Request, res: Response): Promise<void> {
        this.setContextId(this.CONTEXT_ID, res);
        this.setFrontendSocketUrl(res);
        this.prepareMarkoTemplate(res, 'dashboard/index.marko');
    }

}
