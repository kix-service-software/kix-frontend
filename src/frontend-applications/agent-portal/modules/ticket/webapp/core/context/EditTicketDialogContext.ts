/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { Organisation } from '../../../../customer/model/Organisation';
import { Contact } from '../../../../customer/model/Contact';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXModulesSocketClient } from '../../../../base-components/webapp/core/KIXModulesSocketClient';

export class EditTicketDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-ticket-dialog-context';

    private contact: Contact;
    private organisation: Organisation;

    public async initContext(): Promise<void> {
        await this.getObject();
        await super.initContext();
    }

    public async postInit(): Promise<void> {
        const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        const kixPro = releaseInfo?.plugins?.some((p) => p.product === 'KIXPro');

        if (!kixPro) {
            let formId = this.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
            if (!formId) {
                formId = await FormService.getInstance().getFormIdByContext(FormContext.EDIT, KIXObjectType.TICKET);
            }
            this.getFormManager().setFormId(formId, null, true);
        }
    }

    private async loadTicket(): Promise<void> {
        const ticketId = this.getObjectId();
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS]
        );

        let tickets: Ticket[];
        if (ticketId) {
            tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [ticketId], loadingOptions
            );
        }

        let ticket = new Ticket();
        if (tickets && tickets.length) {
            ticket = KIXObjectService.createObjectInstance(KIXObjectType.TICKET, tickets[0]);
        }

        this.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, ticket);
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType = KIXObjectType.TICKET): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.TICKET) {
            object = this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
            if (!object) {
                object = await this.loadTicket();
            }
        } else if (kixObjectType === KIXObjectType.ORGANISATION) {
            object = this.organisation;
        } else if (kixObjectType === KIXObjectType.CONTACT) {
            object = this.contact;
        }
        return object;
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        if (objectType === KIXObjectType.ARTICLE) {
            const ticket = await this.getObject<Ticket>(KIXObjectType.TICKET);
            if (ticket && Array.isArray(ticket.Articles)) {
                return ticket.Articles as any[];
            }
        }
        return this.objectLists.get(objectType) as any[];
    }

    public getObjectId(): number {
        return Number(this.objectId);
    }

}
