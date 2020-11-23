/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { TicketProperty } from '../../../model/TicketProperty';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../../model/Ticket';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { Organisation } from '../../../../customer/model/Organisation';
import { Contact } from '../../../../customer/model/Contact';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
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

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, {
            eventSubscriberId: EditTicketDialogContext.CONTEXT_ID,
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                if (eventId === FormEvent.VALUES_CHANGED) {
                    const organisationValue = data.changedValues.find(
                        (cv) => cv[0] && cv[0].property === TicketProperty.ORGANISATION_ID
                    );
                    if (organisationValue) {
                        this.handleOrganisation(organisationValue[1]);
                    }

                    const contactValue = data.changedValues.find(
                        (cv) => cv[0] && cv[0].property === TicketProperty.CONTACT_ID
                    );
                    if (contactValue) {
                        this.handleContact(contactValue[1]);
                    }
                }
            }

        });

        await this.setFormObject(false);

        const ticket = await this.getObject<Ticket>(KIXObjectType.TICKET);
        if (ticket) {
            this.handleContact(new FormFieldValue(ticket.ContactID));
            this.handleOrganisation(new FormFieldValue(ticket.OrganisationID));
        }
    }

    private async setFormObject(overwrite: boolean = true): Promise<void> {
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
            null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS, TicketProperty.ARTICLES, ArticleProperty.ATTACHMENTS]
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

    public reset(): void {
        super.reset();
        this.contact = null;
        this.organisation = null;
    }

    private async handleOrganisation(value: FormFieldValue): Promise<void> {
        let organisationId = null;
        if (value && value.value) {
            if (!isNaN(value.value)) {
                const organisations = await KIXObjectService.loadObjects<Organisation>(
                    KIXObjectType.ORGANISATION, [value.value]
                );
                if (organisations && organisations.length) {
                    this.organisation = organisations[0];
                    organisationId = this.organisation ? this.organisation.ID : null;
                }
            } else {
                organisationId = value.value;
                this.organisation = null;
            }
        } else {
            this.organisation = null;
        }

        await this.setFormObject();

        this.listeners.forEach(
            (l) => l.objectChanged(organisationId, this.organisation, KIXObjectType.ORGANISATION)
        );
    }

    private async handleContact(value: FormFieldValue): Promise<void> {
        let contactId = null;
        if (value && value.value) {
            if (!isNaN(value.value)) {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [value.value]
                );
                if (contacts && contacts.length) {
                    this.contact = contacts[0];
                    contactId = this.contact ? this.contact.ID : null;
                }
            } else {
                contactId = value.value;
                this.contact = null;
            }
        } else {
            this.contact = null;
        }

        await this.setFormObject();

        this.listeners.forEach(
            (l) => l.objectChanged(contactId, this.contact, KIXObjectType.CONTACT)
        );
    }

}
