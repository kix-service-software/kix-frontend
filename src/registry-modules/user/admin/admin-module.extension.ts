import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, '0_user-management', 'Translatable#User Management', null, [], [
                    new AdminModule(
                        null, 'roles', 'Translatable#Roles/Permissions', null,
                        KIXObjectType.ROLE, 'user-admin-roles'
                    ),
                    new AdminModule(
                        null, 'users', 'Translatable#Agents', null,
                        KIXObjectType.USER, 'user-admin-users'
                    )
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
