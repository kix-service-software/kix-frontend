import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class ReportsMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/reports";
    }

    public getIcon(): string {
        return "kpi-reports";
    }

    public getText(): string {
        return "Reports";
    }

    public getContextId(): string {
        return "reports";
    }

}

module.exports = (data, host, options) => {
    return new ReportsMainMenuExtension();
};
