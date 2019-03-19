import { IKIXModuleExtension } from "../../core/extensions";

class KIXModuleExtension implements IKIXModuleExtension {

    public initComponentId: string = 'admin-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['admin-module-component', 'admin/admin-module-component'],
        ['admin', 'admin/admin-module'],
        ['admin-modules-explorer', 'admin/widgets/admin-modules-explorer'],
        ['i18n-admin-translations', 'i18n/admin/i18n-admin-translations'],
        ['new-translation-dialog', 'i18n/admin/dialogs/new-translation-dialog'],
        ['edit-translation-dialog', 'i18n/admin/dialogs/edit-translation-dialog'],
        ['i18n-translation-details', 'i18n/admin/i18n-translation-details'],
        ['i18n-translation-language-list-widget', 'i18n/admin/widgets/i18n-translation-language-list-widget'],
        ['i18n-translation-info-widget', 'i18n/admin/widgets/i18n-translation-info-widget']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtension();
};
