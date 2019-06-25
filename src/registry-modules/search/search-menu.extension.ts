import { IMainMenuExtension } from '../../core/extensions';
import { TicketListContext } from '../../core/browser/ticket';
import { SearchContext } from '../../core/browser/search/context/SearchContext';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = SearchContext.CONTEXT_ID;

    public contextIds: string[] = [SearchContext.CONTEXT_ID, TicketListContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-search";

    public text: string = "Translatable#Search";

    public permissions: UIComponentPermission[] = [];

}

module.exports = (data, host, options) => {
    return new Extension();
};
