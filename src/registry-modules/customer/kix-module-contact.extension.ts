import { IKIXModuleExtension } from "@kix/core/dist/extensions";

class KIXModuleExtionsion implements IKIXModuleExtension {

    public initComponentId: string = 'contact-module-component';

    public external: boolean = false;

    public tags: Array<[string, string]> = [
        ['contact-module-component', 'customer/contact-module-component'],
        ['contact-module-component', 'customer/contact-module-component'],
        ['contact-details', 'customer/contact-details'],
        ['contact-info-widget', 'customer/widgets/contact-info-widget'],
        ['contact-list-widget', 'customer/widgets/contact-list-widget'],
        ['contact-assigned-customers-widget', 'customer/widgets/contact-assigned-customers-widget'],
        ['contact-assigned-tickets-widget', 'customer/widgets/contact-assigned-tickets-widget'],
        ['new-contact-dialog', 'customer/dialogs/new-contact-dialog'],
        ['edit-contact-dialog', 'customer/dialogs/edit-contact-dialog'],
        ['search-contact-dialog', 'customer/dialogs/search-contact-dialog'],
        ['contact-input-customer', 'customer/dialogs/inputs/contact-input-customer']
    ];

}

module.exports = (data, host, options) => {
    return new KIXModuleExtionsion();
};
