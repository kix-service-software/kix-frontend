/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { EditTicketDialogContext, NewTicketDialogContext, TicketDetailsContext } from './context';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Ticket } from '../../model/Ticket';
import { Contact } from '../../../customer/model/Contact';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { Context } from '../../../../model/Context';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';


export class TicketDialogUtil {

    public static async createTicket(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        let ticketId: number;
        const additionalInformation = [];

        if (context) {
            const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET);
            if (ticket) {
                ticketId = ticket.TicketID;
            }

            const contact = await context.getObject<Contact>(KIXObjectType.CONTACT);
            if (contact) {
                additionalInformation.push([KIXObjectType.CONTACT, contact]);
            }
        }

        ContextService.getInstance().setActiveContext(NewTicketDialogContext.CONTEXT_ID, ticketId);
    }

    public static async editTicket(
        ticketId?: number, articleId?: number, icon?: ObjectIcon | string, text?: string,
        additionalInformation: Array<[string, any]> = [], formId?: string, forceNew?: boolean
    ): Promise<Context> {

        const context = ContextService.getInstance().getActiveContext();

        if (!ticketId && context) {
            ticketId = Number(context.getObjectId());
        }

        let editContext: Context;
        if (ticketId) {
            if (articleId) {
                additionalInformation.push(['REFERENCED_ARTICLE_ID', articleId]);
            }

            additionalInformation.push([AdditionalContextInformation.FORM_ID, formId]);

            editContext = await ContextService.getInstance().setActiveContext(
                EditTicketDialogContext.CONTEXT_ID, ticketId, null, additionalInformation,
                undefined, forceNew
            );

            editContext.setIcon(icon);
            editContext.setDisplayText(text);
        }

        return editContext;

    }

}
