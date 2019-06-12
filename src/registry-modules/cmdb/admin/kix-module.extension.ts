import { IKIXModuleExtension } from "../../../core/extensions";
import { UIComponent } from "../../../core/model/UIComponent";
import { UIComponentPermission } from "../../../core/model/UIComponentPermission";
import { CRUD } from "../../../core/model";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'cmdb-module';

    public initComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-module-component', 'cmdb/module/cmdb-admin-module-component', [
            new UIComponentPermission('system/cmdb/classes/*', [CRUD.UPDATE], true),
            new UIComponentPermission('system/cmdb/classes', [CRUD.CREATE], true)
        ])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('cmdb-admin-ci-classes', 'cmdb/admin/cmdb-admin-ci-classes', []),
        new UIComponent('config-item-class-info-widget', 'cmdb/admin/widgets/config-item-class-info-widget', []),
        new UIComponent(
            'config-item-class-versions-widget', 'cmdb/admin/widgets/config-item-class-versions-widget', []
        ),
        new UIComponent('config-item-class-definition', 'cmdb/config-item-class-definition', []),
        new UIComponent('new-config-item-class-dialog', 'cmdb/admin/dialogs/new-config-item-class-dialog', []),
        new UIComponent('edit-config-item-class-dialog', 'cmdb/admin/dialogs/edit-config-item-class-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
