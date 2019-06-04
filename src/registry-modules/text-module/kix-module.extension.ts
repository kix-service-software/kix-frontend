import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

    public initComponentId: string = 'text-module-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['text-module-module-component', 'text-module/module-component'],
        ['ticket-admin-text-modules', 'text-module/admin/ticket-admin-text-modules']
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
