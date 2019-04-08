import { IAdminModuleExtension, AdminModuleCategory, AdminModule, KIXObjectType } from "../../../core/model";

class Extension implements IAdminModuleExtension {

    public getAdminModules(): AdminModuleCategory[] {
        return [
            new AdminModuleCategory(
                null, 'user-management', 'Translatable#User Management', null, [], [
                    new AdminModule(
                        null, 'users', 'Translatable#Agents', null,
                        KIXObjectType.USER, 'user-admin-users'
                    ),
                    new AdminModule(
                        null, 'roles', 'Translatable#Roles/Permissions', null,
                        KIXObjectType.ROLE, 'user-admin-roles'
                    ),
                ])
        ];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
