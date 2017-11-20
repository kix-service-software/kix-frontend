import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class ReportsMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/reports-dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Reports";
    }

    public getContextId(): string {
        return "reports-dashboard";
    }

}

module.exports = (data, host, options) => {
    return new ReportsMainMenuExtension();
};
