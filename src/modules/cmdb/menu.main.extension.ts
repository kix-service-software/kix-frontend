import { IMainMenuExtension } from '@kix/core';

export class CMDBMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/cmdb-dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "CMDB";
    }

    public getContextId(): string {
        return "cmdb-dashboard";
    }

}

module.exports = (data, host, options) => {
    return new CMDBMainMenuExtension();
};
