/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension } from '../admin/server/IAdminModuleExtension';
import { AdminModule } from '../admin/model/AdminModule';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IAdminModuleExtension {

    public getAdminModules(): Array<AdminModule> {
        return [
            new AdminModule(
                null, 'setup-assistant', 'Translatable#Setup Assistant', null,
                null, 'setup-assistant-overview',
                [
                    new UIComponentPermission('system/config', [CRUD.READ]),
                    new UIComponentPermission('system/config/FQDN', [CRUD.UPDATE])
                ], 1000
            )
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
