import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class DashboardMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/home";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Home";
    }

    public getContextId(): string {
        return "home";
    }

}

module.exports = (data, host, options) => {
    return new DashboardMainMenuExtension();
};
