import { IMainMenuExtension } from '@kix/core';

export class SearchMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/search-dashboard";
    }

    public getIcon(): string {
        return "";
    }

    public getText(): string {
        return "Search";
    }

    public getContextId(): string {
        return "search-dashboard";
    }

}

module.exports = (data, host, options) => {
    return new SearchMainMenuExtension();
};
