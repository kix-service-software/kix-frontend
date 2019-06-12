import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType, CRUD } from "../../../core/model";
import { UIComponentPermission } from "../../../core/model/UIComponentPermission";

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
