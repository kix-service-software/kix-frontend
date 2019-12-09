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

    public id = 'user-module';

    public initComponents: UIComponent[] = [
        new UIComponent('user-module-component', 'core/browser/modules/ui-modules/UserUIModule',
            [
                new UIComponentPermission('system/roles/*', [CRUD.UPDATE]),
                new UIComponentPermission('system/roles', [CRUD.CREATE]),
                new UIComponentPermission('system/users/*', [CRUD.UPDATE]),
                new UIComponentPermission('system/users', [CRUD.CREATE])
            ]
        )
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('user-admin-roles', 'user/admin/user-admin-roles', []),
        new UIComponent('new-user-role-dialog', 'user/admin/dialogs/new-user-role-dialog', []),
        new UIComponent('user-role-info-widget', 'user/admin/widgets/user-role-info-widget', []),
        new UIComponent(
            'user-role-assigned-users-widget', 'user/admin/widgets/user-role-assigned-users-widget', []
        ),
        new UIComponent('edit-user-role-dialog', 'user/admin/dialogs/edit-user-role-dialog', []),
        new UIComponent('user-admin-users', 'user/admin/user-admin-users', []),
        new UIComponent('new-user-dialog', 'user/admin/dialogs/new-user-dialog', []),
        new UIComponent('edit-user-dialog', 'user/admin/dialogs/edit-user-dialog', []),
        new UIComponent('user-info-widget', 'user/admin/widgets/user-info-widget', []),
        new UIComponent('user-personal-settings-widget', 'user/admin/widgets/user-personal-settings-widget', []),
        new UIComponent('user-assigned-roles-widget', 'user/admin/widgets/user-assigned-roles-widget', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
