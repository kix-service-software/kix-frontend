import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class CustomerMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        const dialog = [
            'customer/customer-module',
            'customer/customer-details',
            'customer/widgets/customer-list-widget',
            'customer/widgets/customer-info-widget',
            'customer/widgets/contact-list-widget',
            'customer/widgets/customer-contact-list-widget',
            'customer/dialogs/new-customer-dialog',
            'customer/dialogs/new-contact-dialog',
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
            ['customer-list-widget', 'customer/widgets/customer-list-widget'],
            ['customer-contact-list-widget', 'customer/widgets/customer-contact-list-widget'],
            ['customer-info-widget', 'customer/widgets/customer-info-widget'],
            ['contact-list-widget', 'customer/widgets/contact-list-widget'],
            ['new-customer-dialog', 'customer/dialogs/new-customer-dialog'],
            ['new-contact-dialog', 'customer/dialogs/new-contact-dialog'],
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
