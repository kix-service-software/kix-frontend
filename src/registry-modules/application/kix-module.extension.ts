import { IKIXModuleExtension } from "../../core/extensions";

class KIXModuleExtionsion implements IKIXModuleExtension {

    public initComponentId: string = 'application-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['application-module-component', 'application-module-component'],
        ['home', 'home/home-module'],
        ['release', 'release/release-module'],
        ['search', 'search/search-module'],
        ['search-result-explorer', 'search/widgets/search-result-explorer'],
        ['icon', '_base-components/icon'],
        ['list-with-title', '_base-components/base-html-components/list-with-title'],
        ['link-object-dialog', '_base-components/dialog/link-object-dialog'],
        ['edit-linked-objects-dialog', '_base-components/dialog/edit-linked-objects-dialog'],
        ['toast', '_base-components/overlay/toast'],
        ['confirm-overlay', '_base-components/overlay/confirm-overlay'],
        ['form-default-input', '_base-components/form/inputs/form-default-input'],
        ['form-list', '_base-components/form/inputs/form-list'],
        ['rich-text-input', '_base-components/form/inputs/rich-text-input'],
        ['valid-input', '_base-components/form/inputs/valid-input'],
        ['attachment-input', '_base-components/form/inputs/attachment-input'],
        ['icon-input', '_base-components/form/inputs/icon-input'],
        ['link-input', '_base-components/form/inputs/link-input'],
        ['language-input', '_base-components/form/inputs/language-input'],
        ['general-catalog-input', '_base-components/form/inputs/general-catalog-input'],
        ['text-area-input', '_base-components/form/inputs/text-area-input'],
        ['object-reference-input', '_base-components/form/inputs/object-reference-input'],
        ['date-time-input', '_base-components/form/inputs/date-time-input'],
        ['notes-widget', 'widgets/notes-widget'],
        ['linked-objects-widget', 'widgets/linked-objects-widget'],
        ['help-widget', 'widgets/help-widget']
    ];


}

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
