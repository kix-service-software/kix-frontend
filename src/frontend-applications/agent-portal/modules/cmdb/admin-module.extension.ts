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
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IAdminModuleExtension {

    public getAdminModules(): AdminModule[] {
        return [
            new AdminModule(
                null, 'kix', 'Translatable#KIX', null, null, null, [], 0, [
                new AdminModule(
                    null, 'cmdb', 'Translatable#Assets', null, null, null, [], 0,
                    [
                        new AdminModule(
                            null, 'cmdb-classes', 'Translatable#CI Classes', null,
                            KIXObjectType.CONFIG_ITEM_CLASS, 'cmdb-admin-ci-classes',
                            [
                                new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE], true)
                            ]
                        )
                    ], true)
            ], true)
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
