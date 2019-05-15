import { IMainMenuExtension } from '../../core/extensions';
import { TicketContext, TicketDetailsContext } from '../../core/browser/ticket';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = TicketContext.CONTEXT_ID;

    public contextIds: string[] = [TicketContext.CONTEXT_ID, TicketDetailsContext.CONTEXT_ID];

    public primaryMenu: boolean = true;

    public icon: string = "kix-icon-ticket";

    public text: string = "Translatable#Tickets";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('tickets', [CRUD.READ])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
