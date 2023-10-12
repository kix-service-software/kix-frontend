/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'dynamic-fields-module';

    public external: boolean = false;

    public webDependencies: string[] = [
        './dynamic-fields/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('dynamic-fields-component', '/kix-module-dynamic-fields$0/webapp/core/DynamicFieldsUIModule', [
            new UIComponentPermission('system/dynamicfields', [CRUD.READ])
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'dynamic-field-checklist-cell',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-checklist-cell',
            []
        ),
        new UIComponent(
            'dynamic-field-checklist-progress',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-checklist-progress',
            []
        ),
        new UIComponent(
            'dynamic-field-checklist-text-cell',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-checklist-text-cell',
            []
        ),
        new UIComponent(
            'admin-dynamic-fields',
            '/kix-module-dynamic-fields$0/webapp/components/admin-dynamic-fields',
            []
        ),
        new UIComponent(
            'dynamic-field-checklist-information',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-checklist-information',
            []
        ),
        new UIComponent(
            'dynamic-form-config-input',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-form-config-input',
            []
        ),
        new UIComponent(
            'dynamic-field-checklist-input',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-checklist-input',
            []
        ),
        new UIComponent(
            'dynamic-field-object-property',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-object-property',
            []
        ),
        new UIComponent(
            'dynamic-field-value',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-value',
            []
        ),
        new UIComponent(
            'dynamic-field-table-input',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-table-input',
            []
        ),
        new UIComponent(
            'dynamic-field-table-view',
            '/kix-module-dynamic-fields$0/webapp/components/dynamic-field-table-view',
            []
        )
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
