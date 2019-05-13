import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public id = 'user-module';

    public initComponents: UIComponent[] = [
        new UIComponent('user-module-component', 'user/user-module-component', [])
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
