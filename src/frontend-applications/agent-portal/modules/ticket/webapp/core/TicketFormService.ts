/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { Ticket } from '../../model/Ticket';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../model/configuration/FormContext';
import { TicketProperty } from '../../model/TicketProperty';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ArticleProperty } from '../../model/ArticleProperty';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { TicketParameterUtil } from './TicketParameterUtil';
import { ArticleFormService } from './ArticleFormService';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { Contact } from '../../../customer/model/Contact';
import { Organisation } from '../../../customer/model/Organisation';
import { Channel } from '../../model/Channel';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';

export class TicketFormService extends KIXObjectFormService {

    private static INSTANCE: TicketFormService = null;

    public static getInstance(): TicketFormService {
        if (!TicketFormService.INSTANCE) {
            TicketFormService.INSTANCE = new TicketFormService();
        }

        return TicketFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET;
    }

    protected async getValue(
        property: string, value: any, ticket: Ticket, formField: FormFieldConfiguration,
        formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case TicketProperty.CONTACT_ID:
                value = ticket ? ticket.ContactID : null;
                if (!value) {
                    const context = ContextService.getInstance().getActiveContext();
                    const contact = await context.getObject<Contact>(KIXObjectType.CONTACT);
                    value = contact ? contact.ID : null;
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                value = ticket ? ticket.OrganisationID : null;
                if (!value) {
                    const context = ContextService.getInstance().getActiveContext();
                    const organisation = await context.getObject<Organisation>(KIXObjectType.ORGANISATION);
                    value = organisation ? organisation.ID : null;
                }
                break;
            case TicketProperty.PENDING_TIME:
                if (ticket) {
                    value = ticket[TicketProperty.PENDING_TIME]
                        ? new Date(ticket[TicketProperty.PENDING_TIME]) : null;
                }
                break;
            case ArticleProperty.CHANNEL_ID:
                const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL);
                if (channels && channels.length) {
                    value = channels[0].ID;
                }
                break;
            default:
                if (formContext === FormContext.EDIT) {
                    value = await super.getValue(property, value, ticket, formField, formContext);
                } else {
                    value = formField.defaultValue ? formField.defaultValue.value : null;
                }
        }
        return value;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case TicketProperty.QUEUE_ID:
                hasPermissions = await this.checkPermissions('system/ticket/queues');
                break;
            case TicketProperty.STATE_ID:
                hasPermissions = await this.checkPermissions('system/ticket/states')
                    && await this.checkPermissions('system/ticket/states/types');
                break;
            case TicketProperty.TYPE_ID:
                hasPermissions = await this.checkPermissions('system/ticket/types');
                break;
            case TicketProperty.PRIORITY_ID:
                hasPermissions = await this.checkPermissions('system/ticket/priorities');
                break;
            case TicketProperty.SERVICE_ID:
                hasPermissions = await this.checkPermissions('system/services');
                break;
            case ArticleProperty.CHANNEL_ID:
                hasPermissions = await this.checkPermissions('system/communication/channels');
                break;
            case TicketProperty.LINK:
                hasPermissions = await this.checkPermissions('links', [CRUD.CREATE]);
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                hasPermissions = await this.checkPermissions('system/users');
                break;
            default:
        }
        return hasPermissions;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value);
    }

    public async prepareUpdateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value, true);
    }

    public async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.getPredefinedParameter(forUpdate);
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        await ArticleFormService.prototype.addQueueSignature(parameter);
        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

    public async createFormFieldConfigurations(
        formFields: FormFieldConfiguration[]
    ): Promise<FormFieldConfiguration[]> {
        await super.createFormFieldConfigurations(formFields);

        for (const field of formFields) {
            const label = await LabelService.getInstance().getPropertyText(field.property, KIXObjectType.TICKET);

            switch (field.property) {
                case TicketProperty.CONTACT_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.CONTACT, true);
                    field.label = label;
                    break;
                case TicketProperty.ORGANISATION_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.ORGANISATION);
                    field.label = label;
                    break;
                case TicketProperty.TYPE_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.TICKET_TYPE);
                    field.label = label;
                    break;
                case TicketProperty.QUEUE_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.QUEUE);
                    field.label = label;
                    break;
                case TicketProperty.OWNER_ID:
                case TicketProperty.RESPONSIBLE_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.USER);
                    field.label = label;
                    break;
                case TicketProperty.PRIORITY_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.TICKET_PRIORITY);
                    field.label = label;
                    break;
                case TicketProperty.STATE_ID:
                    field.label = label;
                    field.inputComponent = 'object-reference-input';
                    field.options = this.getObjectReferenceOptions(KIXObjectType.TICKET_STATE);
                    break;
                default:
                    field.label = label;
            }
        }

        const articleFormService = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            KIXObjectType.ARTICLE, ServiceType.FORM
        );
        if (articleFormService) {
            formFields = await articleFormService.createFormFieldConfigurations(formFields);
        }

        return formFields;
    }

    private getObjectReferenceOptions(objectType: KIXObjectType | string, autocomplete?: boolean): FormFieldOption[] {
        return [
            new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType),
            new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, autocomplete)
        ];
    }

}
