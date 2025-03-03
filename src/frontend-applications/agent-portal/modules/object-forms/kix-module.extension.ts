/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public id = 'kix-module-object-forms';

    public applications: string[] = [];

    public external: boolean = false; // true if it is a plugin module

    public webDependencies: string[] = [
        './object-forms/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-object-forms$0/webapp/core/ObjectFormUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('object-form', '/kix-module-object-forms$0/webapp/components/object-form', []),
        new UIComponent(
            'object-form-values-container',
            '/kix-module-object-forms$0/webapp/components/object-form-values-container',
            []
        ),
        new UIComponent(
            'object-form-value',
            '/kix-module-object-forms$0/webapp/components/object-form-values-container/object-form-value',
            []
        ),
        new UIComponent(
            'attachment-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/attachment-form-input',
            []
        ),
        new UIComponent(
            'checkbox-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/checkbox-form-input',
            []
        ),
        new UIComponent(
            'checklist-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/checklist-form-input',
            []
        ),
        new UIComponent(
            'checklist-form-item',
            '/kix-module-object-forms$0/webapp/components/inputs/checklist-form-item',
            []
        ),
        new UIComponent(
            'datetime-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/datetime-form-input',
            []
        ),
        new UIComponent(
            'number-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/number-form-input',
            []
        ),
        new UIComponent(
            'richtext-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/richtext-form-input',
            []
        ),
        new UIComponent(
            'select-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/select-form-input',
            []
        ),
        new UIComponent(
            'table-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/table-form-input',
            []
        ),
        new UIComponent(
            'text-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/text-form-input',
            []
        ),
        new UIComponent(
            'textarea-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/textarea-form-input',
            []
        ),
        new UIComponent(
            'tree-view',
            '/kix-module-object-forms$0/webapp/components/inputs/tree-view',
            []
        ),
        new UIComponent(
            'count-handler-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/count-handler-form-input',
            []
        ),
        new UIComponent(
            'actions-container',
            '/kix-module-object-forms$0/webapp/components/actions-container',
            []
        ),
        new UIComponent(
            'add-remove-form-value-control',
            '/kix-module-object-forms$0/webapp/components/inputs/add-remove-form-value-control',
            []
        ),
        new UIComponent(
            'icon-form-input',
            '/kix-module-object-forms$0/webapp/components/inputs/icon-form-input',
            []
        ),
        new UIComponent(
            'interaction-tell-modal',
            '/kix-module-object-forms$0/webapp/components/interaction-tell-modal',
            []
        ),
        new UIComponent(
            'interaction-ask-modal',
            '/kix-module-object-forms$0/webapp/components/interaction-ask-modal',
            []
        )
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};