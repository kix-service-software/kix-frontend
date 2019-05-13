import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public id = 'contacts-module';

    public initComponents: UIComponent[] = [
        new UIComponent('contact-module-component', 'customer/contact-module-component', [])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('contact-info-widget', 'customer/widgets/contact-info-widget', []),
        new UIComponent(
            'contact-assigned-customers-widget', 'customer/widgets/contact-assigned-customers-widget', []
        ),
        new UIComponent('contact-assigned-tickets-widget', 'customer/widgets/contact-assigned-tickets-widget', []),
        new UIComponent('new-contact-dialog', 'customer/dialogs/new-contact-dialog', []),
        new UIComponent('edit-contact-dialog', 'customer/dialogs/edit-contact-dialog', []),
        new UIComponent('search-contact-dialog', 'customer/dialogs/search-contact-dialog', []),
        new UIComponent('contact-input-customer', 'customer/dialogs/inputs/contact-input-customer', []),
        new UIComponent('create-new-ticket-cell', 'customer/table/create-new-ticket-cell', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
