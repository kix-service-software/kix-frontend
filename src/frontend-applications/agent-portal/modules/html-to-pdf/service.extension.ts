/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServiceExtension } from '../../server/extensions/IServiceExtension';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { HTMLToPDFService } from './server/HTMLToPDFService';

class Extension extends KIXExtension implements IServiceExtension {

    public async initServices(): Promise<void> {
        HTMLToPDFService.getInstance();
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
