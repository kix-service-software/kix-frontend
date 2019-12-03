/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../model/components/context/Context";
import {
    KIXObject, KIXObjectType, TicketProperty, Organisation, Contact,
    IFormInstanceListener, FormFieldValue, FormContext
} from "../../../model";
import { FormService } from "../../form";
import { KIXObjectService } from "../../kix";
import { FormFieldConfiguration } from "../../../model/components/form/configuration";

export class NewTicketDialogContext extends Context implements IFormInstanceListener {

    public static CONTEXT_ID: string = 'new-ticket-dialog-context';
    public formListenerId: string;

    private contact: Contact;
    private organisation: Organisation;

    public async initContext(): Promise<void> {
        this.contact = null;
        this.organisation = null;
        const formId = await FormService.getInstance().getFormIdByContext(FormContext.NEW, KIXObjectType.TICKET);
        this.formListenerId = 'NewTicketDialogContext';
        await FormService.getInstance().registerFormInstanceListener(formId, this);
    }

    public updateForm(): void {
        return;
    }

    public async formValueChanged(
        formField: FormFieldConfiguration, value: FormFieldValue<any>, oldValue: any
    ): Promise<void> {
        if (formField && formField.property === TicketProperty.ORGANISATION_ID) {
            this.handleOrganisationValue(value);
        } else if (formField && formField.property === TicketProperty.CONTACT_ID) {
            this.handleContactValue(value);
        }
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.ORGANISATION) {
            object = this.organisation;
        } else if (kixObjectType === KIXObjectType.CONTACT) {
            object = this.contact;
        }
        return object;
    }

    private async handleOrganisationValue(value: FormFieldValue): Promise<void> {
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

        this.listeners.forEach((l) => l.objectChanged(
            organisationId, this.organisation, KIXObjectType.ORGANISATION
        ));
    }

    private async handleContactValue(value: FormFieldValue): Promise<void> {
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

        this.listeners.forEach((l) => l.objectChanged(
            contactId, this.contact, KIXObjectType.CONTACT
        ));
    }
}
