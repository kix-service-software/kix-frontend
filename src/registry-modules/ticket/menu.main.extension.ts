import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { TicketContext, TicketDetailsContext } from '@kix/core/dist/browser/ticket';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = TicketContext.CONTEXT_ID;

    public contextIds: string[] = [TicketContext.CONTEXT_ID, TicketDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-ticket";

    public text: string = "Tickets";

}

module.exports = (data, host, options) => {
    return new Extension();
};
