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

    public id = 'general-catalog-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'general-catalog-component', '/kix-module-general-catalog$0/webapp/core/GeneralCatalogUIModule', []
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'admin-general-catalog',
            '/kix-module-general-catalog$0/webapp/components/admin-general-catalog', []
        ),
        new UIComponent(
            'edit-general-catalog-dialog',
            '/kix-module-general-catalog$0/webapp/components/edit-general-catalog-dialog', []
        ),
        new UIComponent(
            'new-general-catalog-dialog',
            '/kix-module-general-catalog$0/webapp/components/new-general-catalog-dialog', []
        ),
    ];

    public webDependencies: string[] = [
        './general-catalog/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
