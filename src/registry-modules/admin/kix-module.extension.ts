import { IKIXModuleExtension } from "../../core/extensions";

class KIXModuleExtionsion implements IKIXModuleExtension {

    public initComponentId: string = 'admin-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['admin-module-component', 'admin/admin-module-component'],
        ['admin', 'admin/admin-module'],
        ['admin-modules-explorer', 'admin/widgets/admin-modules-explorer'],
        ['i18n-admin-translations', 'i18n/admin/i18n-admin-translations']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
