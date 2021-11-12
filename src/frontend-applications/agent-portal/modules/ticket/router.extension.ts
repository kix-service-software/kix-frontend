/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServerRouterExtension } from '../../server/extensions/IServerRouterExtension';
import { Router } from 'express';
import { TicketDetailsPrintRouter } from './server/TicketDetailsPrintRouter';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IServerRouterExtension {

    public async registerRouter(expressRouter: Router): Promise<void> {
        expressRouter.use(
            TicketDetailsPrintRouter.getInstance().getBaseRoute(), TicketDetailsPrintRouter.getInstance().getRouter()
        );
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
