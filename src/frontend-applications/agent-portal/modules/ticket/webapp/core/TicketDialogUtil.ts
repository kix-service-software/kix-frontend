/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { EditTicketDialogContext, NewTicketDialogContext } from './context';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Ticket } from '../../model/Ticket';
import { Contact } from '../../../customer/model/Contact';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { Context } from '../../../../model/Context';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { ConfigItem } from '../../../cmdb/model/ConfigItem';


export class TicketDialogUtil {

    public static async createTicket(
        ticketId?: number, articleId?: number, icon?: ObjectIcon | string, text?: string,
        additionalInformation: Array<[string, any]> = [],
    ): Promise<Context> {
        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET);
            if (!ticketId && ticket) {
                ticketId = ticket.TicketID;
            }

            const contact = await context.getObject<Contact>(KIXObjectType.CONTACT);
            if (contact) {
                additionalInformation.push([KIXObjectType.CONTACT, contact]);
            }

            const configItem = await context.getObject<ConfigItem>(KIXObjectType.CONFIG_ITEM);
            if (configItem) {
                additionalInformation.push([`${KIXObjectType.CONFIG_ITEM}-ID`, configItem.ConfigItemID]);
            }
        }

        if (articleId) {
            additionalInformation.push(['REFERENCED_ARTICLE_ID', articleId]);
        }

        const newContext = await ContextService.getInstance().setActiveContext(
            NewTicketDialogContext.CONTEXT_ID, ticketId, undefined, additionalInformation
        );
        newContext.setIcon(icon);
        newContext.setDisplayText(text);

        return newContext;
    }

    public static async editTicket(
        ticketId?: number, articleId?: number, icon?: ObjectIcon | string, text?: string,
        additionalInformation: Array<[string, any]> = [], formId?: string,
        contextId: string = EditTicketDialogContext.CONTEXT_ID
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

            const existingContext = ContextService.getInstance().getContextInstances().find(
                (c) => c.descriptor.contextId === contextId && c.getObjectId() === ticketId
            );

            if (existingContext) {
                await ContextService.getInstance().removeContext(existingContext.instanceId, null, null, false);
            }

            editContext = await ContextService.getInstance().setActiveContext(
                contextId, ticketId, null, additionalInformation
            );

            editContext.setIcon(icon);
            editContext.setDisplayText(text);
        }

        return editContext;

    }

}
