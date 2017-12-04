import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class CustomerMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/customer";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Customer";
    }

    public getContextId(): string {
        return "customer";
    }

}

module.exports = (data, host, options) => {
    return new CustomerMainMenuExtension();
};
