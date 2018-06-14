import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { ContextMode, KIXObjectType } from '@kix/core/dist/model';
import { SearchContext } from '@kix/core/dist/browser/search';

export class MainMenuExtension implements IMainMenuExtension {

    public link: string = "/" + SearchContext.CONTEXT_ID;

    public icon: string = "search";

    public text: string = "Suche";

    public contextId: string = SearchContext.CONTEXT_ID;

    public contextMode: ContextMode = ContextMode.DASHBOARD;

    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;
}

module.exports = (data, host, options) => {
    return new MainMenuExtension();
};
