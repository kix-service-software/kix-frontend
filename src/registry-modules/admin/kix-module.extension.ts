import { IKIXModuleExtension } from "@kix/core/dist/extensions";

class KIXModuleExtionsion implements IKIXModuleExtension {

    public initComponentId: string = 'admin-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['admin-module-component', 'admin/admin-module-component'],
        ['admin', 'admin/admin-module']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
