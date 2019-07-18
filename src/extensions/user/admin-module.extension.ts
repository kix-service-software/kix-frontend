/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'user-management', 'Translatable#User Management', null, [], [
                    new AdminModule(
                        null, 'users', 'Translatable#Agents', null,
                        KIXObjectType.USER, 'user-admin-users', [
                            new UIComponentPermission('system/users', [CRUD.CREATE], true),
                            new UIComponentPermission('system/users/*', [CRUD.UPDATE], true)
                        ]
                    ),
                    new AdminModule(
                        null, 'roles', 'Translatable#Roles/Permissions', null,
                        KIXObjectType.ROLE, 'user-admin-roles', [
                            new UIComponentPermission('system/roles', [CRUD.CREATE], true),
                            new UIComponentPermission('system/roles/*', [CRUD.UPDATE], true)
                        ]
                    ),
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
