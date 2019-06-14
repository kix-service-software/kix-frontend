import { IKIXModuleExtension } from "../../core/extensions";

class KIXModuleExtension implements IKIXModuleExtension {

    public initComponentId: string = 'system-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['system-module-component', 'system/system-module-component'],
        ['system-admin-sysconfig', 'system/admin/system-admin-sysconfig'],
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtension();
};
