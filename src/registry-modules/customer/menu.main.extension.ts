import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { CustomerContext } from '@kix/core/dist/browser/customer';

export class CustomerMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/" + CustomerContext.CONTEXT_ID;
    }

    public getIcon(): string {
        return "customers";
    }

    public getText(): string {
        return "Kunden";
    }

    public getContextId(): string {
        return CustomerContext.CONTEXT_ID;
    }

}

module.exports = (data, host, options) => {
    return new CustomerMainMenuExtension();
};
