import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class ServicesMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/services";
    }

    public getIcon(): string {
        return "handshake";
    }

    public getText(): string {
        return "Services";
    }

    public getContextId(): string {
        return "services";
    }

}

module.exports = (data, host, options) => {
    return new ServicesMainMenuExtension();
};
