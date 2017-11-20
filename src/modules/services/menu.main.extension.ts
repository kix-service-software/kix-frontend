import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class ServicesMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/services-dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Services";
    }

    public getContextId(): string {
        return "services-dashboard";
    }

}

module.exports = (data, host, options) => {
    return new ServicesMainMenuExtension();
};
