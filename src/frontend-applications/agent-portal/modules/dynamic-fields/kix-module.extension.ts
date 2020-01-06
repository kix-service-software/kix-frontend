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
import { UIComponentPermission } from "../../model/UIComponentPermission";
import { CRUD } from "../../../../server/model/rest/CRUD";

class Extension implements IKIXModuleExtension {

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
            'admin-dynamic-fields', '/kix-module-dynamic-fields$0/webapp/components/admin-dynamic-fields', []
        ),
        new UIComponent(
            'new-dynamic-field-dialog', '/kix-module-dynamic-fields$0/webapp/components/new-dynamic-field-dialog', []
        ),
        new UIComponent(
            'dynamic-form-config-input', '/kix-module-dynamic-fields$0/webapp/components/dynamic-form-config-input', []
        ),
        new UIComponent(
            'edit-dynamic-field-dialog', '/kix-module-dynamic-fields$0/webapp/components/edit-dynamic-field-dialog', []
        )
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
