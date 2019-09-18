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

    public tags: Array<[string, string]>;

    public id = 'cmdb-module';

    public initComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-module-component', 'core/browser/modules/ui-modules/CMDBAdminUIModule', [
            new UIComponentPermission('system/cmdb/classes/*', [CRUD.UPDATE], true),
            new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE], true)
        ]),
        new UIComponent('general-catalog-admin-module-component',
            'core/browser/modules/ui-modules/GeneralCatalogUIModule', [
            new UIComponentPermission('system/generalcatalog/*', [CRUD.UPDATE], true),
            new UIComponentPermission('system/generalcatalog', [CRUD.CREATE], true)
        ])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-ci-classes', 'cmdb/admin/cmdb-admin-ci-classes', []),
        new UIComponent('config-item-class-info-widget', 'cmdb/admin/widgets/config-item-class-info-widget', []),
        new UIComponent('config-item-class-definition', 'cmdb/config-item-class-definition', []),
        new UIComponent('new-config-item-class-dialog', 'cmdb/admin/dialogs/new-config-item-class-dialog', []),
        new UIComponent('edit-config-item-class-dialog', 'cmdb/admin/dialogs/edit-config-item-class-dialog', []),
        new UIComponent('cmdb-admin-general-catalog', 'cmdb/admin/cmdb-admin-general-catalog', []),
        new UIComponent('new-general-catalog-dialog', 'cmdb/admin/dialogs/new-general-catalog-dialog', []),
        new UIComponent('edit-general-catalog-dialog', 'cmdb/admin/dialogs/edit-general-catalog-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
