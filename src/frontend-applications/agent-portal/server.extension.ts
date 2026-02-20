/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Server } from './server/Server';
import { IFrontendServerExtension } from '../../server/model/IFrontendServerExtension';
import { KIXExtension } from '../../server/model/KIXExtension';

class Extension extends KIXExtension implements IFrontendServerExtension {

    public name: string = 'agent-portal';

    public getServer(): any {
        return Server.getInstance();
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
