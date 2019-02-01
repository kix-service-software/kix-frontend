import { IMainMenuExtension } from '../../core/extensions';
import { AdminContext } from '../../core/browser/admin';
import {
    TicketTypeDetailsContext, TicketStateDetailsContext, TicketPriorityDetailsContext
} from '../../core/browser/ticket';
import { ConfigItemClassDetailsContext } from '../../core/browser/cmdb';
import { TranslationDetailsContext } from '../../core/browser/i18n/admin/context';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = AdminContext.CONTEXT_ID;

    public contextIds: string[] = [
        AdminContext.CONTEXT_ID,
        TicketTypeDetailsContext.CONTEXT_ID,
        TicketStateDetailsContext.CONTEXT_ID,
        TicketPriorityDetailsContext.CONTEXT_ID,
        ConfigItemClassDetailsContext.CONTEXT_ID,
        TranslationDetailsContext.CONTEXT_ID,
        TicketTypeDetailsContext.CONTEXT_ID,
        TicketPriorityDetailsContext.CONTEXT_ID,
        TicketStateDetailsContext.CONTEXT_ID,
        ConfigItemClassDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = false;

    public icon: string = "kix-icon-admin";

    public text: string = "Admin";



}

module.exports = (data, host, options) => {
    return new Extension();
};
