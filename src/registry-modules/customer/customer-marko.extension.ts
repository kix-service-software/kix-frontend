import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class CustomerMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        const dialog = [
            'customer/dialogs/new-customer-dialog',
            'customer/dialogs/inputs/customer-input-valid'
        ];

        return [
            ...dialog
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['new-customer-dialog', 'customer/dialogs/new-customer-dialog'],
            ['customer-input-valid', 'customer/dialogs/inputs/customer-input-valid']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new CustomerMarkoDependencyExtension();
};
