import { Request, Response, Router } from 'express';
import { IRouter } from './IRouter';
import { IServerConfiguration } from '../core/common';
import { ProfilingService, ConfigurationService } from '../core/services';

export abstract class KIXRouter implements IRouter {

    protected router: Router;
    protected serverConfig: IServerConfiguration;

    private appTemplate: any;

    public constructor() {
        this.router = Router();
        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        this.initialize();
    }

    public getRouter(): Router {
        return this.router;
    }

    public setAppTemplate(appTemplate: any): void {
        this.appTemplate = appTemplate;
    }

    public abstract getBaseRoute(): string;

    protected abstract initialize(): void;

    protected async prepareMarkoTemplate(res: Response, contextId: string, objectId: string): Promise<void> {

        // start profiling
        const profileTaskId = ProfilingService.getInstance().start(
            'KIXRouter',
            contextId + (objectId ? '/' + objectId : ''),
        );

        this.setFrontendSocketUrl(res);

        res.marko(this.appTemplate);

        // stop profiling
        ProfilingService.getInstance().stop(profileTaskId, this.appTemplate);
    }

    protected getServerUrl(): string {
        return this.serverConfig.FRONTEND_URL;
    }

    protected async getToken(req: Request): Promise<string> {
        const token = req.cookies.token;
        return token;
    }

    protected setContextId(contextId: string, res: Response): void {
        res.cookie('contextId', contextId);
    }

    protected setFrontendSocketUrl(res: Response): void {
        const socketTimeout = ConfigurationService.getInstance().getServerConfiguration().SOCKET_TIMEOUT;
        res.cookie('frontendSocketUrl', this.getServerUrl());
        res.cookie('socketTimeout', socketTimeout);
    }
}
