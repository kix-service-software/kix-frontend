import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class CMDBMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/cmdb";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "CMDB";
    }

    public getContextId(): string {
        return "cmdb";
    }

}

module.exports = (data, host, options) => {
    return new CMDBMainMenuExtension();
};
