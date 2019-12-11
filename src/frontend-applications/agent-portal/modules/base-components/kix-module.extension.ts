/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { UIComponent } from "../../model/UIComponent";

class Extension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'base-components-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('base-component', '/kix-module-base-components$0/webapp/core/BaseComponentsUIModule', []),
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('action', '/kix-module-base-components$0/webapp/components/action', []),
        new UIComponent('action-list', '/kix-module-base-components$0/webapp/components/action-list', []),
        new UIComponent('attachment-input', '/kix-module-base-components$0/webapp/components/attachment-input', []),
        new UIComponent('bookmarks', '/kix-module-base-components$0/webapp/components/bookmarks', []),
        new UIComponent('chart', '/kix-module-base-components$0/webapp/components/chart', []),
        new UIComponent('checkbox-input', '/kix-module-base-components$0/webapp/components/checkbox-input', []),
        new UIComponent('date-time-input', '/kix-module-base-components$0/webapp/components/date-time-input', []),
        new UIComponent(
            'default-select-input', '/kix-module-base-components$0/webapp/components/default-select-input', []
        ),
        new UIComponent('default-text-input', '/kix-module-base-components$0/webapp/components/default-text-input', []),
        new UIComponent(
            'dynamic-form-field-container',
            '/kix-module-base-components$0/webapp/components/dynamic-form-field-container', []
        ),
        new UIComponent('editor', '/kix-module-base-components$0/webapp/components/editor', []),
        new UIComponent('explorerbar', '/kix-module-base-components$0/webapp/components/explorerbar', []),
        new UIComponent('field-container', '/kix-module-base-components$0/webapp/components/field-container', []),
        new UIComponent('file-entry', '/kix-module-base-components$0/webapp/components/file-entry', []),
        new UIComponent('filter', '/kix-module-base-components$0/webapp/components/filter', []),
        new UIComponent('form-list', '/kix-module-base-components$0/webapp/components/form-list', []),
        new UIComponent('form-list-tree', '/kix-module-base-components$0/webapp/components/form-list-tree', []),
        new UIComponent('help-widget', '/kix-module-base-components$0/webapp/components/help-widget', []),
        new UIComponent('kix-footer', '/kix-module-base-components$0/webapp/components/kix-footer', []),
        new UIComponent('label-list', '/kix-module-base-components$0/webapp/components/label-list', []),
        new UIComponent('label-value-group', '/kix-module-base-components$0/webapp/components/label-value-group', []),
        new UIComponent('language-input', '/kix-module-base-components$0/webapp/components/language-input', []),
        new UIComponent('link-target', '/kix-module-base-components$0/webapp/components/link-target', []),
        new UIComponent('loading-shield', '/kix-module-base-components$0/webapp/components/loading-shield', []),
        new UIComponent('loading-spinner', '/kix-module-base-components$0/webapp/components/loading-spinner', []),
        new UIComponent('main-form', '/kix-module-base-components$0/webapp/components/main-form', []),
        new UIComponent('notes-widget', '/kix-module-base-components$0/webapp/components/notes-widget', []),
        new UIComponent('number-input', '/kix-module-base-components$0/webapp/components/number-input', []),
        new UIComponent(
            'object-details-page', '/kix-module-base-components$0/webapp/components/object-details-page', []
        ),
        new UIComponent('object-information', '/kix-module-base-components$0/webapp/components/object-information', []),
        new UIComponent(
            'object-information-widget', '/kix-module-base-components$0/webapp/components/object-information-widget', []
        ),
        new UIComponent(
            'object-property-label', '/kix-module-base-components$0/webapp/components/object-property-label', []
        ),
        new UIComponent(
            'object-reference-input', '/kix-module-base-components$0/webapp/components/object-reference-input', []
        ),
        new UIComponent('overlay', '/kix-module-base-components$0/webapp/components/overlay', []),
        new UIComponent(
            'confirm-overlay', '/kix-module-base-components$0/webapp/components/overlay/confirm-overlay', []
        ),
        new UIComponent(
            'refresh-app-toast', '/kix-module-base-components$0/webapp/components/overlay/refresh-app-toast', []
        ),
        new UIComponent(
            'table-column-filter-overlay',
            '/kix-module-base-components$0/webapp/components/overlay/table-column-filter-overlay', []
        ),
        new UIComponent('toast', '/kix-module-base-components$0/webapp/components/overlay/toast', []),
        new UIComponent('overlay-icon', '/kix-module-base-components$0/webapp/components/overlay-icon', []),
        new UIComponent('quick-search', '/kix-module-base-components$0/webapp/components/quick-search', []),
        new UIComponent('rich-text-input', '/kix-module-base-components$0/webapp/components/rich-text-input', []),
        new UIComponent('router-outlet', '/kix-module-base-components$0/webapp/components/router-outlet', []),
        new UIComponent('search-form', '/kix-module-base-components$0/webapp/components/search-form', []),
        new UIComponent('sidebar', '/kix-module-base-components$0/webapp/components/sidebar', []),
        new UIComponent('sidebar-menu', '/kix-module-base-components$0/webapp/components/sidebar-menu', []),
        new UIComponent('standard-table-NEW', '/kix-module-base-components$0/webapp/components/standard-table-NEW', []),

        new UIComponent(
            'crud-cell',
            '/kix-module-base-components$0/webapp/components' +
            '/standard-table-NEW/table-body/table-row/table-cell-NEW/crud-cell',
            []
        ),
        new UIComponent(
            'default-cell-content',
            '/kix-module-base-components$0/webapp/components' +
            '/standard-table-NEW/table-body/table-row/table-cell-NEW/default-cell-content',
            []
        ),
        new UIComponent(
            'label-list-cell-content',
            '/kix-module-base-components$0/webapp/components' +
            '/standard-table-NEW/table-body/table-row/table-cell-NEW/label-list-cell-content',
            []
        ),
        new UIComponent(
            'multiline-cell',
            '/kix-module-base-components$0/webapp/components' +
            '/standard-table-NEW/table-body/table-row/table-cell-NEW/multiline-cell',
            []
        ),
        new UIComponent('tab-container', '/kix-module-base-components$0/webapp/components/tab-container', []),
        new UIComponent('tab-widget', '/kix-module-base-components$0/webapp/components/tab-widget', []),
        new UIComponent('table-widget', '/kix-module-base-components$0/webapp/components/table-widget', []),
        new UIComponent('text-area-input', '/kix-module-base-components$0/webapp/components/text-area-input', []),
        new UIComponent('timer', '/kix-module-base-components$0/webapp/components/timer', []),
        new UIComponent('translation-string', '/kix-module-base-components$0/webapp/components/translation-string', []),
        new UIComponent('tree', '/kix-module-base-components$0/webapp/components/tree', []),
        new UIComponent('widget', '/kix-module-base-components$0/webapp/components/widget', []),
        new UIComponent('widget-container', '/kix-module-base-components$0/webapp/components/widget-container', [])
    ];

    public webDependencies: string[] = [
        './base-components/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};