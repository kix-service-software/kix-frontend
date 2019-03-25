import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'user-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['user-module-component', 'user/user-module-component'],
        ['user-admin-roles', 'user/admin/user-admin-roles'],
        ['new-user-role-dialog', 'user/admin/dialogs/new-user-role-dialog'],
        ['user-role-details', 'user/admin/user-role-details'],
        ['user-role-info-widget', 'user/admin/widgets/user-role-info-widget'],
        ['user-role-assigned-users-widget', 'user/admin/widgets/user-role-assigned-users-widget'],
        ['user-role-assigned-permissions-widget', 'user/admin/widgets/user-role-assigned-permissions-widget'],
        ['user-admin-users', 'user/admin/user-admin-users']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
