import { IMainMenuExtension } from '../../core/extensions';
import { TicketContext, TicketDetailsContext } from '../../core/browser/ticket';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = TicketContext.CONTEXT_ID;

    public contextIds: string[] = [TicketContext.CONTEXT_ID, TicketDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-ticket";

    public text: string = "Translatable#Tickets";

}

module.exports = (data, host, options) => {
    return new Extension();
};
