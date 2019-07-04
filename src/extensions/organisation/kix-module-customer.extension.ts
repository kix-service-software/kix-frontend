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
