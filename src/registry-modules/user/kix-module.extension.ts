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
        ['edit-user-role-dialog', 'user/admin/dialogs/edit-user-role-dialog'],
        ['user-admin-users', 'user/admin/user-admin-users'],
        ['new-user-dialog', 'user/admin/dialogs/new-user-dialog'],
        ['edit-user-dialog', 'user/admin/dialogs/edit-user-dialog'],
        ['user-info-widget', 'user/admin/widgets/user-info-widget'],
        ['user-personal-settings-widget', 'user/admin/widgets/user-personal-settings-widget'],
        ['user-assigned-roles-widget', 'user/admin/widgets/user-assigned-roles-widget']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
