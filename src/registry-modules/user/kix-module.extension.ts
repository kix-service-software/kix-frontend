import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'user-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['user-module-component', 'user/user-module-component'],
        ['user-admin-roles', 'user/admin/user-admin-roles'],
        ['new-user-role-dialog', 'user/admin/dialogs/new-user-role-dialog'],
        ['permissions-input', 'user/admin/dialogs/inputs/permissions-input'],
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
