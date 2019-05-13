import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public initComponents: UIComponent[] = [
        new UIComponent('application-module-component', 'application-module-component', [])
    ];

    public external: boolean = false;

    public getUIComponents(): UIComponent[] {
        return [
            new UIComponent('home', 'home/home-module', []),
            new UIComponent('release', 'release/release-module', []),
            new UIComponent('search', 'search/search-module', []),
            new UIComponent('search-result-explorer', 'search/widgets/search-result-explorer', []),
            new UIComponent('icon', '_base-components/icon', []),
            new UIComponent('list-with-title', '_base-components/base-html-components/list-with-title', []),
            new UIComponent('link-object-dialog', '_base-components/dialog/link-object-dialog', []),
            new UIComponent('edit-linked-objects-dialog', '_base-components/dialog/edit-linked-objects-dialog', []),
            new UIComponent('toast', '_base-components/overlay/toast', []),
            new UIComponent('refresh-app-toast', '_base-components/overlay/refresh-app-toast', []),
            new UIComponent('confirm-overlay', '_base-components/overlay/confirm-overlay', []),
            new UIComponent('table-column-filter-overlay', '_base-components/overlay/table-column-filter-overlay', []),
            new UIComponent('default-text-input', '_base-components/form/inputs/default-text-input', []),
            new UIComponent('default-select-input', '_base-components/form/inputs/default-select-input', []),
            new UIComponent('form-list', '_base-components/form/inputs/form-list', []),
            new UIComponent('rich-text-input', '_base-components/form/inputs/rich-text-input', []),
            new UIComponent('valid-input', '_base-components/form/inputs/valid-input', []),
            new UIComponent('attachment-input', '_base-components/form/inputs/attachment-input', []),
            new UIComponent('icon-input', '_base-components/form/inputs/icon-input', []),
            new UIComponent('link-input', '_base-components/form/inputs/link-input', []),
            new UIComponent('language-input', '_base-components/form/inputs/language-input', []),
            new UIComponent('general-catalog-input', '_base-components/form/inputs/general-catalog-input', []),
            new UIComponent('text-area-input', '_base-components/form/inputs/text-area-input', []),
            new UIComponent('object-reference-input', '_base-components/form/inputs/object-reference-input', []),
            new UIComponent('number-input', '_base-components/form/inputs/number-input', []),
            new UIComponent('date-time-input', '_base-components/form/inputs/date-time-input', []),
            new UIComponent('notes-widget', 'widgets/notes-widget', []),
            new UIComponent('linked-objects-widget', 'widgets/linked-objects-widget', []),
            new UIComponent('help-widget', 'widgets/help-widget', []),
            new UIComponent('personal-settings-dialog', '_base-components/dialog/personal-settings-dialog', []),
            new UIComponent('bulk-dialog', '_base-components/dialog/bulk-dialog', []),
            new UIComponent('table-widget', 'widgets/table-widget', []),
            new UIComponent(
                'label-list-cell-content',
                '_base-components/standard-table-NEW/table-body/table-row/table-cell-NEW/label-list-cell-content',
                []
            ),
            new UIComponent(
                'multiline-cell',
                '_base-components/standard-table-NEW/table-body/table-row/table-cell-NEW/multiline-cell',
                []
            ),
            new UIComponent(
                'crud-cell',
                '_base-components/standard-table-NEW/table-body/table-row/table-cell-NEW/crud-cell',
                []
            ),
            new UIComponent('checkbox-input', '_base-components/form/inputs/checkbox-input', []),
            new UIComponent('translation-string', '_base-components/translation-string', []),
            new UIComponent('import-dialog', '_base-components/dialog/import-dialog', []),
            new UIComponent('permissions-form-input', 'permission/admin/dialogs/inputs/permissions-form-input', []),
            new UIComponent('permission-input', 'permission/admin/dialogs/inputs/permission-input', []),
            new UIComponent(
                'assign-role-permission-input',
                'permission/admin/dialogs/inputs/assign-role-permission-input',
                []
            ),
            new UIComponent('object-details-page', '_base-components/object-details-page', []),
            new UIComponent('new-system-address-dialog', 'communication/admin/dialogs/new-system-address-dialog', [])
        ];
    }


}

module.exports = (data, host, options) => {
    return new Extension();
};
