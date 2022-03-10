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
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';

export class TicketFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.TICKET;

    public id: string = 'TicketFormFieldValueHandler';

    private subscriber: IEventSubscriber = {
        eventSubscriberId: 'TicketFormFieldValueHandler',
        eventPublished: (data: any, eventId: string): void => {
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
            await this.handleOrganisationValue(formInstance, contactValue[1].value);
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

    public async postInitValues(formInstance: FormInstance): Promise<void> {
        const contactValue = await formInstance.getFormFieldValueByProperty(TicketProperty.CONTACT_ID);
        this.handleOrganisationValue(formInstance, contactValue?.value);
    }

    private async handleOrganisationValue(
        formInstance: FormInstance, contactId: any
    ): Promise<void> {
        if (contactId) {
            const field = formInstance.getFormFieldByProperty(TicketProperty.ORGANISATION_ID);
            if (field) {
                const organisationIds: [number, number[]] = await this.getOrganisationsFromContact(contactId);
                if (organisationIds[0]) {

                    // set new value (org) if current is not new primary AND not in possible list
                    const fieldValue = formInstance.getFormFieldValue(field.instanceId);
                    if (
                        fieldValue?.value !== organisationIds[0] &&
                        (
                            !Array.isArray(organisationIds[1])
                            || !organisationIds[1].some((oId) => Number(oId) === Number(fieldValue?.value))
                        )
                    ) {
                        formInstance.provideFormFieldValues([[field.instanceId, organisationIds[0]]], null);
                    }

                    // provide possible values for organisations
                    formInstance.setPossibleValue(
                        TicketProperty.ORGANISATION_ID, new FormFieldValue(organisationIds[1] || [organisationIds[0]])
                    );
                } else {
                    formInstance.setPossibleValue(
                        TicketProperty.ORGANISATION_ID, new FormFieldValue(null)
                    );
                }
            }
        }
    }

    private async getOrganisationsFromContact(contactId: number): Promise<[number, number[]]> {
        let organisationIds: [number, number[]];
        if (!isNaN(contactId)) {
            const contacts = await KIXObjectService.loadObjects<Contact>(

                // use loadingOptions to prevent unnecessary preload
                KIXObjectType.CONTACT, [contactId], new KIXObjectLoadingOptions()
            );
            if (contacts?.length) {
                organisationIds = [contacts[0].PrimaryOrganisationID, contacts[0].OrganisationIDs];
            }
        } else {
            organisationIds = [contactId, null];
        }
        return organisationIds;
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
