import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public id = 'text-module-module';

    public initComponents: UIComponent[] = [
        new UIComponent('text-module-module-component', 'text-module/module-component', [
            new UIComponentPermission('textmodules', [CRUD.CREATE], true),
            new UIComponentPermission('textmodules/*', [CRUD.UPDATE], true)
        ])
    ];

    public external: boolean = false;

    public tags: Array<[string, string]>;

    public uiComponents: UIComponent[] = [
        new UIComponent('ticket-admin-text-modules', 'text-module/admin/ticket-admin-text-modules', []),
        new UIComponent('new-text-module-dialog', 'text-module/admin/dialogs/new-text-module-dialog', []),
        new UIComponent('edit-text-module-dialog', 'text-module/admin/dialogs/edit-text-module-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
