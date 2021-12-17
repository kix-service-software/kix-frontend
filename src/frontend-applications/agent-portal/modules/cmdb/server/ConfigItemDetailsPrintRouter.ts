/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from '../../../server/routes/KIXRouter';
import { AuthenticationService } from '../../../server/services/AuthenticationService';
import { ConfigItemDetailsDataBuilder } from './ConfigItemDetailsDataBuilder';


export class ConfigItemDetailsPrintRouter extends KIXRouter {

    private static INSTANCE: ConfigItemDetailsPrintRouter;

    public static getInstance(): ConfigItemDetailsPrintRouter {
        if (!ConfigItemDetailsPrintRouter.INSTANCE) {
            ConfigItemDetailsPrintRouter.INSTANCE = new ConfigItemDetailsPrintRouter();
        }
        return ConfigItemDetailsPrintRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/cmdb/configitems';
    }

    protected initialize(): void {
        this.router.get(
            '/:objectId/print',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getPrintComponent.bind(this)
        );
    }

    private async getPrintComponent(req: Request, res: Response): Promise<void> {
        const token: string = req.cookies.token;
        const favIcon = await this.getIcon('agent-portal-icon');
        const versionIdS = req.query.versionIds?.toString().split(',').map((id) => Number(id)) || [];
        const data = await ConfigItemDetailsDataBuilder.buildCIData(token, Number(req.params.objectId), versionIdS);
        const template = require('../webapp/components/config-item-details-print').default;
        (res as any).marko(template, { favIcon, ...data });
    }

}
