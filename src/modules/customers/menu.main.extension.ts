import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class CustomerMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/customers";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Customers";
    }

    public getContextId(): string {
        return "customers";
    }

}

module.exports = (data, host, options) => {
    return new CustomerMainMenuExtension();
};
