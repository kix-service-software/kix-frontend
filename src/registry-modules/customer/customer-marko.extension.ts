import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class CustomerMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        const dialog = [
            'customer/customer-module',
            'customer/customer-details',
            'customer/contact-details',
            'customer/widgets/customer-list-widget',
            'customer/widgets/customer-info-widget',
            'customer/widgets/customer-assigned-contacts-widget',
            'customer/widgets/customer-assigned-tickets-widget',
            'customer/widgets/contact-list-widget',
            'customer/widgets/contact-info-widget',
            'customer/widgets/contact-assigned-customers-widget',
            'customer/widgets/contact-assigned-tickets-widget',
            'customer/dialogs/new-customer-dialog',
            'customer/dialogs/new-contact-dialog',
            'customer/dialogs/search-contact-dialog',
            'customer/dialogs/search-customer-dialog',
            'customer/dialogs/inputs/customer-input-valid',
            'customer/dialogs/inputs/contact-input-customer'
        ];

        return [
            ...dialog
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['customers', 'customer/customer-module'],
            ['customer-details', 'customer/customer-details'],
            ['contact-details', 'customer/contact-details'],
            ['customer-list-widget', 'customer/widgets/customer-list-widget'],
            ['customer-info-widget', 'customer/widgets/customer-info-widget'],
            ['customer-assigned-contacts-widget', 'customer/widgets/customer-assigned-contacts-widget'],
            ['customer-assigned-tickets-widget', 'customer/widgets/customer-assigned-tickets-widget'],
            ['contact-info-widget', 'customer/widgets/contact-info-widget'],
            ['contact-list-widget', 'customer/widgets/contact-list-widget'],
            ['contact-assigned-customers-widget', 'customer/widgets/contact-assigned-customers-widget'],
            ['contact-assigned-tickets-widget', 'customer/widgets/contact-assigned-tickets-widget'],
            ['new-customer-dialog', 'customer/dialogs/new-customer-dialog'],
            ['new-contact-dialog', 'customer/dialogs/new-contact-dialog'],
            ['search-contact-dialog', 'customer/dialogs/search-contact-dialog'],
            ['search-customer-dialog', 'customer/dialogs/search-customer-dialog'],
            ['customer-input-valid', 'customer/dialogs/inputs/customer-input-valid'],
            ['contact-input-customer', 'customer/dialogs/inputs/contact-input-customer']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new CustomerMarkoDependencyExtension();
};
