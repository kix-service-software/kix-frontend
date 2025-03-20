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
                null, 'kix', 'Translatable#KIX', null, null, null, [], 0,
                [
                    new AdminModule(
                        null, 'user-management', 'Translatable#User Management', null, null, null, [], 0,
                        [
                            new AdminModule(
                                null, 'users', 'Translatable#Users', null,
                                KIXObjectType.USER, 'user-admin-users',
                                [
                                    new UIComponentPermission('system/users', [CRUD.CREATE], true)
                                ]
                            ),
                            new AdminModule(
                                null, 'roles', 'Translatable#Roles/Permissions', null,
                                KIXObjectType.ROLE, 'user-admin-roles',
                                [
                                    new UIComponentPermission('system/roles', [CRUD.CREATE], true)
                                ]
                            ),
                        ], true
                    )
                ], true
            )
        ];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
