/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServerRouterExtension } from '../../server/extensions/IServerRouterExtension';
import { Router } from 'express';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { ArticleRouter } from './server/ArticleRouter';

class Extension extends KIXExtension implements IServerRouterExtension {

    public async registerRouter(expressRouter: Router): Promise<void> {
        expressRouter.use(
            ArticleRouter.getInstance().getBaseRoute(), ArticleRouter.getInstance().getRouter()
        );
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
