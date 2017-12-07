import { IMainMenuExtension } from '@kix/core/dist/extensions';

export class SearchMainMenuExtension implements IMainMenuExtension {

    public getLink(): string {
        return "/search";
    }

    public getIcon(): string {
        return "search";
    }

    public getText(): string {
        return "Search";
    }

    public getContextId(): string {
        return "search";
    }

}

module.exports = (data, host, options) => {
    return new SearchMainMenuExtension();
};
