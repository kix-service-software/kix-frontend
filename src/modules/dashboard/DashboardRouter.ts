import { Router, Request, Response } from 'express';
import { KIXRouter } from '@kix/core/dist/routes';

export class DashboardRouter extends KIXRouter {

    public getContextId(): string {
        return "dashboard";
    }

    public getBaseRoute(): string {
        return "/dashboard";
    }

    protected initialize(): void {
        this.router.get("/", this.authenticationService.isAuthenticated.bind(this.authenticationService),
            this.getDashboard.bind(this));
    }

    private async getDashboard(req: Request, res: Response): Promise<void> {
        this.prepareMarkoTemplate(res, 'dashboard/index.marko', false);
    }

}
