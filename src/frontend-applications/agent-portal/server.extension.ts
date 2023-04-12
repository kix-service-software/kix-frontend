/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Server } from './server/Server';
import { IFrontendServerExtension } from '../../server/model/IFrontendServerExtension';
import { IServer } from '../../server/model/IServer';
import { KIXExtension } from '../../server/model/KIXExtension';

class Extension extends KIXExtension implements IFrontendServerExtension {

    public name: string = 'Agent Portal Server';

    public getServer(): IServer {
        return Server.getInstance();
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
