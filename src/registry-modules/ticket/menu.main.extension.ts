import { IMainMenuExtension } from '@kix/core/dist/extensions';
import { ContextMode, KIXObjectType } from '@kix/core/dist/model';

export class TicketsMainMenuExtension implements IMainMenuExtension {

    public link: string = "/tickets";

    public icon: string = "ticket";

    public text: string = "Tickets";

    public contextId: string = "tickets";

    public contextMode: ContextMode = ContextMode.LIST;

    public KIXObjectType: KIXObjectType = KIXObjectType.TICKET;

}

module.exports = (data, host, options) => {
    return new TicketsMainMenuExtension();
};
