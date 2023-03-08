/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXModulesSocketClient } from '../../../../base-components/webapp/core/KIXModulesSocketClient';

export class NewTicketDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-ticket-dialog-context';

    private contact: any;
    private organisation: any;

    private bindingIds: string[] = [];

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        if (!this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT)) {
            this.setNewTicketObject();
        }

        const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        const kixPro = releaseInfo?.plugins?.some((p) => p.product === 'KIXPro');

        if (!kixPro) {
            const formId = await FormService.getInstance().getFormIdByContext(FormContext.NEW, KIXObjectType.TICKET);
            this.getFormManager().setFormId(formId, null, true, false);
        }

        await super.initContext(urlParams);
    }

    public setNewTicketObject(ticket?: Ticket): void {
        const oldTicket: KIXObject = this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
        if (oldTicket) {
            oldTicket.removeBindings(this.bindingIds);
        }

        if (!ticket) {
            ticket = new Ticket();
        }

        this.contact = null;
        this.organisation = null;

        this.addTicketBindings(ticket);
        this.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, ticket);
    }

    private addTicketBindings(ticket: Ticket): void {
        this.bindingIds = [];

        this.bindingIds.push(
            ticket.addBinding(TicketProperty.CONTACT_ID, (value: number) => {
                this.handleContactValue(value);
            })
        );

        this.bindingIds.push(
            ticket.addBinding(TicketProperty.ORGANISATION_ID, (value: number) => {
                this.handleOrganisationValue(value);
            })
        );
    }

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = KIXObjectType.TICKET, reload: boolean = false
    ): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.TICKET) {
            if (reload) {
                this.setNewTicketObject();
            }
            object = this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
        } else if (kixObjectType === KIXObjectType.ORGANISATION) {
            object = this.organisation;
        } else if (kixObjectType === KIXObjectType.CONTACT) {
            object = this.contact || this.getAdditionalInformation(KIXObjectType.CONTACT);
        }
        return object;
    }

    private async handleOrganisationValue(organisationId: number): Promise<void> {
        if (!isNaN(organisationId)) {
            const organisations = await KIXObjectService.loadObjects(
                KIXObjectType.ORGANISATION, [organisationId]
            );
            if (organisations && organisations.length) {
                this.organisation = organisations[0];
            }
        } else {
            this.organisation = null;
        }

        this.listeners.forEach((l) => l.objectChanged(
            organisationId, this.organisation, KIXObjectType.ORGANISATION
        ));
    }

    private async handleContactValue(contactId: number): Promise<void> {
        if (!isNaN(contactId)) {
            const contacts = await KIXObjectService.loadObjects(
                KIXObjectType.CONTACT, [contactId]
            );
            if (contacts && contacts.length) {
                this.contact = contacts[0];
            }
        }
        else {
            this.contact = null;
        }

        this.listeners.forEach((l) => l.objectChanged(
            contactId, this.contact, KIXObjectType.CONTACT
        ));
    }


}
