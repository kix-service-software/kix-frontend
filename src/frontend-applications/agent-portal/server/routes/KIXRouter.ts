/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ObjectIconLoadingOptions } from '../model/ObjectIconLoadingOptions';
import { ObjectIcon } from '../../modules/icon/model/ObjectIcon';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../services/KIXObjectServiceRegistry';
import { ObjectResponse } from '../services/ObjectResponse';

export abstract class KIXRouter implements IRouter {

    protected router: Router;
    protected serverConfig: IServerConfiguration;

    public constructor() {
        this.router = Router();
        this.serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        this.initialize();
    }

    public getRouter(): Router {
        return this.router;
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

    protected setFrontendSocketUrl(res: Response): void {
        res.cookie('frontendSocketUrl', this.getServerUrl());
    }

    protected async getIcon(name: string): Promise<ObjectIcon> {
        const config = ConfigurationService.getInstance().getServerConfiguration();
        if (config && config.BACKEND_API_TOKEN) {
            // FIXME: do not use ObjectIconAPIService directly, there is a circular reference somewhere
            const service = KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.OBJECT_ICON);
            if (service) {
                const logoLoadingOptions = new ObjectIconLoadingOptions(name, name);
                const objectResponse = await service.loadObjects<ObjectIcon>(
                    config.BACKEND_API_TOKEN, '',
                    KIXObjectType.OBJECT_ICON, null, null, logoLoadingOptions
                ).catch(() => new ObjectResponse<ObjectIcon>());

                const icons = objectResponse?.objects || [];
                return icons?.length ? icons[0] : null;
            }
        }
        return null;
    }
}
