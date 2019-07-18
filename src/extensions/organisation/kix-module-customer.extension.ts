/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public id: string = 'customer-module';

    public external: boolean = false;

    public tags: Array<[string, string]>;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'customer-module-component', 'core/browser/modules/ui-modules/CustomerUIModule',
            [
                new UIComponentPermission('organisations', [CRUD.READ], true),
                new UIComponentPermission('contacts', [CRUD.READ], true)
            ]
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('organisations', 'organisation/organisation-module', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
