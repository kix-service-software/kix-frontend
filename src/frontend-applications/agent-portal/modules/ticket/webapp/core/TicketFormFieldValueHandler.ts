/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValueHandler } from '../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { TicketProperty } from '../../model/TicketProperty';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Contact } from '../../../customer/model/Contact';
import { TicketService } from './TicketService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { IdService } from '../../../../model/IdService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { FAQEvent } from '../../../faq/webapp/core';
import { IEventSubscriber } from '../../../base-components/webapp/core/IEventSubscriber';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ArticleProperty } from '../../model/ArticleProperty';
import { Attachment } from '../../../../model/kix/Attachment';
import { FormService } from '../../../base-components/webapp/core/FormService';

export class TicketFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.TICKET;

    public id: string = 'TicketFormFieldValueHandler';

    private subscriber: IEventSubscriber = {
        eventSubscriberId: 'TicketFormFieldValueHandler',
        eventPublished: (data: any, eventId: string) => {
            if (eventId === FAQEvent.APPEND_FAQ_ARTICLE_HTML) {
                this.handleAppendFAQArticleHTML(data);
            } else if (eventId === FAQEvent.APPEND_FAQ_ARTICLE_ATTACHMENTS) {
                this.handleAppendFAQArticleAttachments(data);
            }
        }
    };

    public constructor() {
        super();
        EventService.getInstance().subscribe(FAQEvent.APPEND_FAQ_ARTICLE_HTML, this.subscriber);
        EventService.getInstance().subscribe(FAQEvent.APPEND_FAQ_ARTICLE_ATTACHMENTS, this.subscriber);
    }

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        const contactValue = changedFieldValues.find((cv) => cv[0] && cv[0].property === TicketProperty.CONTACT_ID);
        if (contactValue) {
            let organisationId: number | string = null;
            if (contactValue[1].value) {
                organisationId = await this.getOrganisationsFromContact(contactValue[1].value);
            }

            const field = formInstance.getFormFieldByProperty(TicketProperty.ORGANISATION_ID);
            if (field) {
                formInstance.provideFormFieldValues([[field.instanceId, organisationId]], null);
            }
        }

        const stateValue = changedFieldValues.find((cv) => cv[0] && cv[0].property === TicketProperty.STATE_ID);
        if (stateValue && stateValue[1]) {
            const isPending = stateValue[1].value
                ? await TicketService.isPendingState(stateValue[1].value)
                : false;

            if (isPending) {
                this.setPendingTimeField(formInstance);
            } else {
                const pendingField = formInstance.getFormFieldByProperty(TicketProperty.PENDING_TIME);
                if (pendingField) {
                    formInstance.removeFormField(pendingField);
                }
            }
        }

        const valueHandler = FormService.getInstance().getFormFieldValueHandler(KIXObjectType.ARTICLE);
        if (valueHandler) {
            for (const handler of valueHandler) {
                handler.handleFormFieldValues(formInstance, changedFieldValues);
            }
        }
    }

    private async getOrganisationsFromContact(contactId: number): Promise<number | string> {
        let organisationId: number;
        if (!isNaN(contactId)) {
            const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [contactId]);
            if (contacts && contacts.length) {
                const contact = contacts[0];
                organisationId = contact.PrimaryOrganisationID;
            }
        } else {
            organisationId = contactId;
        }
        return organisationId;
    }

    private async setPendingTimeField(formInstance: FormInstance): Promise<void> {
        const existingField = formInstance.getFormFieldByProperty(TicketProperty.PENDING_TIME);

        if (!existingField) {
            const label = await LabelService.getInstance().getPropertyText(
                TicketProperty.PENDING_TIME, KIXObjectType.TICKET
            );
            const pendingField = new FormFieldConfiguration(
                'pending-time-field',
                label, TicketProperty.PENDING_TIME, 'ticket-input-state-pending', true,
                null, null, null, undefined, undefined, undefined, undefined, undefined,
                null, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                false
            );

            const stateField = formInstance.getFormFieldByProperty(TicketProperty.STATE_ID);
            if (stateField) {
                formInstance.addFieldChildren(stateField, [pendingField]);
            } else {
                pendingField.instanceId = IdService.generateDateBasedId();
                formInstance.getForm().pages[0].groups[0].formFields.push(pendingField);
            }

            const date = new Date();
            let offset = 86400;
            const offsetConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_FRONTEND_PENDING_DIFF_TIME], null, null, true
            ).catch((error): SysConfigOption[] => []);

            if (Array.isArray(offsetConfig) && offsetConfig[0].Value) {
                offset = offsetConfig[0].Value;
            }

            date.setSeconds(date.getSeconds() + Number(offset));
            formInstance.provideFormFieldValues(
                [[pendingField.instanceId, date]], null, true
            );
        }
    }

    private async handleAppendFAQArticleHTML(faqArticleHTML: string): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance) {
            const bodyField = formInstance.getFormFieldByProperty(ArticleProperty.BODY);
            if (bodyField) {
                let newValue = faqArticleHTML;
                const value = formInstance.getFormFieldValue<string>(bodyField.instanceId);
                if (value && value.value) {
                    newValue = value.value + faqArticleHTML;
                }

                formInstance.provideFormFieldValues([[bodyField.instanceId, newValue]], null);
            }
        }
    }

    private async handleAppendFAQArticleAttachments(faqAttachmnents: Attachment[]): Promise<void> {
        if (Array.isArray(faqAttachmnents) && faqAttachmnents.length) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            if (formInstance) {
                const attachmentField = formInstance.getFormFieldByProperty(ArticleProperty.ATTACHMENTS);
                if (attachmentField) {
                    let newValue = faqAttachmnents;
                    const value = formInstance.getFormFieldValue(attachmentField.instanceId);
                    if (value && Array.isArray(value.value)) {
                        newValue = [...value.value, ...faqAttachmnents];
                    }

                    formInstance.provideFormFieldValues([[attachmentField.instanceId, newValue]], null);
                }
            }
        }
    }

}
