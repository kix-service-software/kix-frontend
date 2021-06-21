/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TicketProperty } from '../../../model/TicketProperty';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { Organisation } from '../../../../customer/model/Organisation';
import { Contact } from '../../../../customer/model/Contact';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { KIXObjectFormService } from '../../../../base-components/webapp/core/KIXObjectFormService';
import { ArticleProperty } from '../../../model/ArticleProperty';

export class EditTicketDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-ticket-dialog-context';

    private contact: Contact;
    private organisation: Organisation;

    public async initContext(): Promise<void> {
        await super.initContext();
        await this.setFormObject(false);
    }

    public async setFormObject(overwrite: boolean = true): Promise<void> {
        const formId = this.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            KIXObjectType.TICKET, ServiceType.FORM
        );
        if (service) {
            const ticket = await this.loadTicket();
            let formObject = ticket;
            if (overwrite) {
                const parameter = await service.getFormParameter(formId);
                parameter.forEach((p) => {
                    if (p[1] !== undefined) {
                        formObject[p[0]] = p[1];
                    }
                });

                formObject = await KIXObjectService.createObjectInstance<any>(
                    KIXObjectType.TICKET, formObject
                );
            }
            this.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, formObject);
        }
    }

    private async loadTicket(): Promise<Ticket> {
        const ticketId = this.getObjectId();
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                KIXObjectProperty.DYNAMIC_FIELDS,
                TicketProperty.ARTICLES,
                ArticleProperty.ATTACHMENTS
            ]
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

        return ticket;
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
