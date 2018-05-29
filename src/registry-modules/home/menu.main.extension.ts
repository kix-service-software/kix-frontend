import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { HomeContext } from '@kix/core/dist/browser/home';

export class DashboardMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/home";
    }

    public getIcon(): string {
        return "home";
    }

    public getText(): string {
        return "Home";
    }

    public getContextId(): string {
        return HomeContext.CONTEXT_ID;
    }

}

module.exports = (data, host, options) => {
    return new DashboardMainMenuExtension();
};
