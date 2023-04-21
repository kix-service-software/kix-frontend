/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IServiceExtension } from '../../server/extensions/IServiceExtension';
import { DynamicFieldAPIService } from './server/DynamicFieldService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IServiceExtension {

    public async initServices(): Promise<void> {
        DynamicFieldAPIService.getInstance();
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
