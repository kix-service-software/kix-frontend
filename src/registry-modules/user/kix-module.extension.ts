import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'user-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['user-module-component', 'user/user-module-component'],
        ['user-admin-roles', 'user/admin/user-admin-roles'],
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
