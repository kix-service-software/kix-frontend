import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { SearchContext } from '@kix/core/dist/browser/search';
import { TicketListContext } from '@kix/core/dist/browser/ticket';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = SearchContext.CONTEXT_ID;

    public contextIds: string[] = [SearchContext.CONTEXT_ID, TicketListContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-search";

    public text: string = "Suche";

}

module.exports = (data, host, options) => {
    return new Extension();
};
