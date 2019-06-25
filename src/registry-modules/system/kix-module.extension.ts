import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { CRUD } from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";

class KIXModuleExtension implements IKIXModuleExtension {

    public id: string = 'sysconfig-module';

    public external: boolean = false;

    public tags: Array<[string, string]>;

    public initComponents: UIComponent[] = [
        new UIComponent('system-module-component', 'system/system-module-component', [
            new UIComponentPermission('system/config', [CRUD.CREATE], true),
            new UIComponentPermission('system/config', [CRUD.UPDATE], true)
        ])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('system-admin-sysconfig', 'system/admin/system-admin-sysconfig', [])
    ];


}

module.exports = (data, host, options) => {
    return new KIXModuleExtension();
};
