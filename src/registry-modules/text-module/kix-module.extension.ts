import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public id = 'text-module-module';

    public initComponents: UIComponent[] = [
        new UIComponent('text-module-module-component', 'text-module/module-component', [])
    ];

    public external: boolean = false;

    public tags: Array<[string, string]>;

    public uiComponents: UIComponent[] = [
        new UIComponent('ticket-admin-text-modules', 'text-module/admin/ticket-admin-text-modules', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
