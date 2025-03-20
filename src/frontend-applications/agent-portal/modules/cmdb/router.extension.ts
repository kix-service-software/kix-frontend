/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Router } from 'express';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { IServerRouterExtension } from '../../server/extensions/IServerRouterExtension';
import { ConfigItemDetailsPrintRouter } from './server/ConfigItemDetailsPrintRouter';


class Extension extends KIXExtension implements IServerRouterExtension {

    public async registerRouter(expressRouter: Router): Promise<void> {
        expressRouter.use(
            ConfigItemDetailsPrintRouter.getInstance().getBaseRoute(),
            ConfigItemDetailsPrintRouter.getInstance().getRouter()
        );
    }

}

module.exports = (): Extension => {
    return new Extension();
};
