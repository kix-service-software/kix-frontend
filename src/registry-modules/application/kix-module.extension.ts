import { IKIXModuleExtension } from "../../core/extensions";

class Extension implements IKIXModuleExtension {

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
        ['refresh-app-toast', '_base-components/overlay/refresh-app-toast'],
        ['confirm-overlay', '_base-components/overlay/confirm-overlay'],
        ['table-column-filter-overlay', '_base-components/overlay/table-column-filter-overlay'],
        ['default-text-input', '_base-components/form/inputs/default-text-input'],
        ['default-select-input', '_base-components/form/inputs/default-select-input'],
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
        ['help-widget', 'widgets/help-widget'],
        ['personal-settings-dialog', '_base-components/dialog/personal-settings-dialog'],
        ['bulk-dialog', '_base-components/dialog/bulk-dialog'],
        ['table-widget', 'widgets/table-widget'],
        // tslint:disable-next-line:max-line-length
        ['label-list-cell-content', '_base-components/standard-table-NEW/table-body/table-row/table-cell-NEW/label-list-cell-content'],
        ['multiline-cell', '_base-components/standard-table-NEW/table-body/table-row/table-cell-NEW/multiline-cell'],
        ['crud-cell', '_base-components/standard-table-NEW/table-body/table-row/table-cell-NEW/crud-cell'],
        ['checkbox-input', '_base-components/form/inputs/checkbox-input'],
        ['translation-string', '_base-components/translation-string'],
        ['import-dialog', '_base-components/dialog/import-dialog'],
        ['permissions-form-input', 'permission/admin/dialogs/inputs/permissions-form-input'],
        ['permission-input', 'permission/admin/dialogs/inputs/permission-input'],
        ['assign-role-permission-input', 'permission/admin/dialogs/inputs/assign-role-permission-input'],
        ['object-details-page', '_base-components/object-details-page']
    ];


}

module.exports = (data, host, options) => {
    return new Extension();
};
