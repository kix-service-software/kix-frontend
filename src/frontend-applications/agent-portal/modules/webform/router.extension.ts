/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServerRouterExtension } from '../../server/extensions/IServerRouterExtension';
import { KIXIntegrationRouter } from './server/KIXIntegrationRouter';
import { Router } from 'express';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IServerRouterExtension {

    public async registerRouter(expressRouter: Router): Promise<void> {
        expressRouter.use(
            KIXIntegrationRouter.getInstance().getBaseRoute(), KIXIntegrationRouter.getInstance().getRouter()
        );
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
