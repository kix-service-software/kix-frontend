/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigItemSearchContext } from './webapp/core';

export class Extension {

    public getModuleId(): string {
        return ConfigItemSearchContext.CONTEXT_ID;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
