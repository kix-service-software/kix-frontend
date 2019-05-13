import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'organisations-module';

    public initComponents: UIComponent[] = [
        new UIComponent('customer-module-component', 'customer/customer-module-component', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('customer-module-component', 'customer/customer-module-component', []),
        new UIComponent('customers', 'customer/customer-module', []),
        new UIComponent('customer-info-widget', 'customer/widgets/customer-info-widget', []),
        new UIComponent(
            'customer-assigned-contacts-widget', 'customer/widgets/customer-assigned-contacts-widget', []
        ),
        new UIComponent(
            'customer-assigned-tickets-widget', 'customer/widgets/customer-assigned-tickets-widget', []
        ),
        new UIComponent('new-customer-dialog', 'customer/dialogs/new-customer-dialog', []),
        new UIComponent('edit-customer-dialog', 'customer/dialogs/edit-customer-dialog', []),
        new UIComponent('search-customer-dialog', 'customer/dialogs/search-customer-dialog', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
