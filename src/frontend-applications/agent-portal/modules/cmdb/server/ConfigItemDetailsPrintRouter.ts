/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { ConfigItemDetailsDataBuilder } from './ConfigItemDetailsDataBuilder';
import { APIUtil } from '../../../server/api/APIUtil';


export class ConfigItemDetailsPrintRouter {

    private static INSTANCE: ConfigItemDetailsPrintRouter;

    public static getInstance(): ConfigItemDetailsPrintRouter {
        if (!ConfigItemDetailsPrintRouter.INSTANCE) {
            ConfigItemDetailsPrintRouter.INSTANCE = new ConfigItemDetailsPrintRouter();
        }
        return ConfigItemDetailsPrintRouter.INSTANCE;
    }

    public getBaseRoute(): string {
        return '/cmdb/configitems';
    }

    protected initialize(): void {
        // this.router.get(
        //     '/:objectId/print',
        //     this.getPrintComponent.bind(this)
        // );
    }

    private async getPrintComponent(req: Request, res: Response): Promise<void> {
        const token: string = req.cookies.token;
        const favIcon = await APIUtil.getIcon('agent-portal-icon');
        const versionIdS = req.query.versionIds?.toString().split(',').map((id) => Number(id)) || [];
        const data = await ConfigItemDetailsDataBuilder.buildCIData(token, Number(req.params.objectId), versionIdS);
        const template = require('../webapp/components/config-item-details-print').default;
        (res as any).marko(template, { favIcon, ...data });
    }

}
