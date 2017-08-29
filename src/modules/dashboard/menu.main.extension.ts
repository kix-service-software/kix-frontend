import { IMainMenuExtension } from './../../extensions';

export class DashboardMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Home";
    }

}

module.exports = (data, host, options) => {
    return new DashboardMainMenuExtension();
};
