/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response, Router } from 'express';
import { IRouter } from './IRouter';
import { IServerConfiguration } from '../../../../server/model/IServerConfiguration';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';

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
        res.cookie('frontendSocketUrl', this.getServerUrl());
    }
}
