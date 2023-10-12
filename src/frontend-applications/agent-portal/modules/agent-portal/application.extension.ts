/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMarkoApplication } from '../../server/extensions/IMarkoApplication';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IMarkoApplication {

    public name: string = 'agent-portal';
    public path: string = 'webapp/application';
    public internal: boolean = true;

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
