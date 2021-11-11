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
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { KIXObjectFormService } from '../../../../base-components/webapp/core/KIXObjectFormService';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';

export class NewTicketDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-ticket-dialog-context';

    private contact: any;
    private organisation: any;

    private subscriber: IEventSubscriber;

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        await super.initContext(urlParams);
        this.contact = null;
        this.organisation = null;

        this.subscriber = {
            eventSubscriberId: NewTicketDialogContext.CONTEXT_ID,
            eventPublished: async (data: FormValuesChangedEventData, eventId: string): Promise<void> => {
                const form = data.formInstance.getForm();
                await this.setFormObject();
                if (form.objectType === KIXObjectType.TICKET && form.formContext === FormContext.NEW) {
                    const organisationValue = data.changedValues.find(
                        (cv) => cv[0]?.property === TicketProperty.ORGANISATION_ID
                    );
                    if (organisationValue) {
                        this.handleOrganisationValue(organisationValue[1].value);
                    }

                    const contactValue = data.changedValues.find(
                        (cv) => cv[0]?.property === TicketProperty.CONTACT_ID
                    );
                    if (contactValue) {
                        this.handleContactValue(contactValue[1].value);
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    public async postInit(): Promise<void> {
        await super.postInit();

        await this.setFormObject();

        const formInstance = await this.getFormManager().getFormInstance();
        const contactValue = await formInstance?.getFormFieldValueByProperty<number>(TicketProperty.CONTACT_ID);
        if (contactValue && contactValue.value) {
            await this.handleContactValue(contactValue.value);
        }
    }

    public async destroy(): Promise<void> {
        await super.destroy();
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    public async setFormObject(overwrite: boolean = true): Promise<void> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            KIXObjectType.TICKET, ServiceType.FORM
        );
        if (service) {
            const formId = this.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
            const newObject = {};
            const parameter = await service.getFormParameter(formId, null, false);
            parameter.forEach((p) => {
                if (p[1] !== undefined) {
                    newObject[p[0]] = p[1];
                }
            });

            const formObject = await KIXObjectService.createObjectInstance<any>(
                KIXObjectType.TICKET, newObject
            );
            this.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, formObject);
        }
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType = KIXObjectType.TICKET): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.TICKET) {
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
        } else {
            this.contact = null;
        }

        this.listeners.forEach((l) => l.objectChanged(
            contactId, this.contact, KIXObjectType.CONTACT
        ));
    }
}
