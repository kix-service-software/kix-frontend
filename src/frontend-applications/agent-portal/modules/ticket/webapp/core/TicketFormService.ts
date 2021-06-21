/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { DefaultSelectInputFormOption } from '../../../../model/configuration/DefaultSelectInputFormOption';
import { TicketService } from './TicketService';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { QueueProperty } from '../../model/QueueProperty';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { IdService } from '../../../../model/IdService';
import { Context } from '../../../../model/Context';
import { Article } from '../../model/Article';

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

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {
        const value = await formInstance.getFormFieldValueByProperty<number>(ArticleProperty.CHANNEL_ID);
        if (value && value.value) {
            const channelFields = await ArticleFormService.getInstance().getFormFieldsForChannel(
                formInstance, value.value, form.id, true
            );

            const field = formInstance.getFormFieldByProperty(ArticleProperty.CHANNEL_ID);
            formInstance.addFieldChildren(field, channelFields, true);
        }
        const stateValue = await formInstance.getFormFieldValueByProperty<number>(TicketProperty.STATE_ID);
        if (stateValue && stateValue.value) {
            const isPending = stateValue.value
                ? await TicketService.isPendingState(stateValue.value)
                : false;

            if (isPending) {
                await this.setPendingTimeField(formInstance, kixObject as Ticket, form.formContext);
            }
        }
    }

    // TODO: nearly (value handling, await on provide) copied from TicketFormFieldValueHandler - can use same function?
    private async setPendingTimeField(
        formInstance: FormInstance, ticket: Ticket, formContext: FormContext
    ): Promise<void> {
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

            const date = await this.getValue(TicketProperty.PENDING_TIME, null, ticket, pendingField, formContext);

            await formInstance.provideFormFieldValues(
                [[pendingField.instanceId, date]], null, true, false
            );
        }
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
                    if (organisation) {
                        value = organisation;
                    } else {
                        const contact = await context.getObject<Contact>(KIXObjectType.CONTACT);
                        value = contact ? contact.PrimaryOrganisationID : null;
                    }
                }
                break;
            case TicketProperty.PENDING_TIME:
                if (ticket) {
                    value = ticket[TicketProperty.PENDING_TIME]
                        ? new Date(ticket[TicketProperty.PENDING_TIME]) : null;
                }
                break;
            case ArticleProperty.SUBJECT:
                value = await ArticleFormService.getInstance().getSubjectFieldValue();
                break;
            case ArticleProperty.BODY:
                value = await ArticleFormService.getInstance().getBodyFieldValue();
                break;
            case ArticleProperty.ATTACHMENTS:
                value = await ArticleFormService.getInstance().getAttachmentFieldValue();
                break;
            case ArticleProperty.TO:
                value = await ArticleFormService.getInstance().getToFieldValue(
                    ContextService.getInstance().getActiveContext()
                );
                break;
            case ArticleProperty.CHANNEL_ID:
                const dialogContext = ContextService.getInstance().getActiveContext();
                if (dialogContext) {
                    const isReplyDialog = dialogContext.getAdditionalInformation('ARTICLE_REPLY');
                    if (isReplyDialog) {
                        const referencedArticle = await ArticleFormService.getInstance().getReferencedArticle(
                            dialogContext, ticket
                        );
                        if (referencedArticle) {
                            value = referencedArticle.ChannelID;
                        }
                    } else {
                        const isForwardDialog = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
                        if (isForwardDialog) {
                            value = 2;
                        }
                    }
                } else if (formContext === FormContext.NEW) {
                    const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL);
                    if (channels && channels.length) {
                        value = channels[0].ID;
                    }
                } else {
                    value = formField.defaultValue ? Array.isArray(formField.defaultValue.value)
                        ? formField.defaultValue.value[0] : formField.defaultValue.value : null;
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
                hasPermissions = await this.checkPermissions('system/ticket/states');
                // KIX2018-4537
                // && await this.checkPermissions('system/ticket/states/types');
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
        const lockParameter = parameter.find((p) => p[0] === TicketProperty.LOCK_ID);
        if (lockParameter && Array.isArray(lockParameter[1])) {
            lockParameter[1] = lockParameter[1][0];
        }

        // use defaults for new ticket if not given
        if (formContext && formContext === FormContext.NEW) {
            const contactIndex = parameter.findIndex((p) => p[0] === TicketProperty.CONTACT_ID);
            if (contactIndex === -1 || !parameter[contactIndex][1]) {
                const currentUser = await AgentService.getInstance().getCurrentUser();
                if (contactIndex !== -1) {
                    parameter.splice(contactIndex, 1);
                }
                parameter.push([TicketProperty.CONTACT_ID, currentUser?.Contact?.ID]);
            }

            const organisationIndex = parameter.findIndex((p) => p[0] === TicketProperty.ORGANISATION_ID);
            if (organisationIndex === -1 || !parameter[organisationIndex][1]) {
                const contactParameter = parameter.find((p) => p[0] === TicketProperty.CONTACT_ID);
                if (contactParameter) {
                    const contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, [contactParameter[1]], null, null, true
                    ).catch((e) => []);

                    if (organisationIndex !== -1) {
                        parameter.splice(organisationIndex, 1);
                    }

                    parameter.push([TicketProperty.ORGANISATION_ID, contacts[0]?.PrimaryOrganisationID]);
                }
            }

            const priorityIndex = parameter.findIndex((p) => p[0] === TicketProperty.PRIORITY_ID);
            if (priorityIndex === -1 || !parameter[priorityIndex][1]) {
                const priorityId = await TicketService.getDefaultPriorityID();

                if (priorityIndex !== -1) {
                    parameter.splice(priorityIndex, 1);
                }

                parameter.push([TicketProperty.PRIORITY_ID, priorityId]);
            }

            const queueIndex = parameter.findIndex((p) => p[0] === TicketProperty.QUEUE_ID);
            if (queueIndex === -1 || !parameter[queueIndex][1]) {
                const queueId = await TicketService.getDefaultQueueID();

                if (queueIndex !== -1) {
                    parameter.splice(queueIndex, 1);
                }

                parameter.push([TicketProperty.QUEUE_ID, queueId]);
            }

            const typeIndex = parameter.findIndex((p) => p[0] === TicketProperty.TYPE_ID);
            if (typeIndex === -1 || !parameter[typeIndex][1]) {
                const typeId = await TicketService.getDefaultTypeID();

                if (typeIndex !== -1) {
                    parameter.splice(typeIndex, 1);
                }

                parameter.push([TicketProperty.TYPE_ID, typeId]);
            }

            const stateIndex = parameter.findIndex((p) => p[0] === TicketProperty.STATE_ID);
            if (stateIndex === -1 || !parameter[stateIndex][1]) {
                const typeId = await TicketService.getDefaultStateID();

                if (stateIndex !== -1) {
                    parameter.splice(stateIndex, 1);
                }

                parameter.push([TicketProperty.STATE_ID, typeId]);
            }
        }

        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

    public async createFormFieldConfigurations(
        formFields: FormFieldConfiguration[], useArticleFormService: boolean = true
    ): Promise<FormFieldConfiguration[]> {
        await super.createFormFieldConfigurations(formFields);

        for (const field of formFields) {
            const label = await LabelService.getInstance().getPropertyText(field.property, KIXObjectType.TICKET);

            if (!Array.isArray(field.options)) {
                field.options = [];
            }

            switch (field.property) {
                case TicketProperty.CONTACT_ID:
                    field.inputComponent = 'ticket-input-contact';
                    field.options = [
                        ...field.options,
                    ];
                    field.label = label;
                    break;
                case TicketProperty.ORGANISATION_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = [
                        ...field.options,
                        ...this.getObjectReferenceOptions(KIXObjectType.ORGANISATION)
                    ];
                    field.label = label;
                    break;
                case TicketProperty.TYPE_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = [
                        ...field.options,
                        ...this.getObjectReferenceOptions(KIXObjectType.TICKET_TYPE)
                    ];
                    field.label = label;
                    break;
                case TicketProperty.QUEUE_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = [
                        ...field.options,
                        ...this.getObjectReferenceOptions(KIXObjectType.QUEUE)
                    ];
                    field.label = label;
                    break;
                case TicketProperty.OWNER_ID:
                case TicketProperty.RESPONSIBLE_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = [
                        ...field.options,
                        ...this.getObjectReferenceOptions(KIXObjectType.USER, true)
                    ];
                    field.options.push(
                        new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                            new KIXObjectLoadingOptions(
                                [
                                    new FilterCriteria(
                                        KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                        FilterType.AND, 1
                                    )
                                ], undefined, undefined, undefined, undefined,
                                [
                                    ['requiredPermission', 'TicketRead,TicketCreate']
                                ]
                            )
                        )
                    );
                    field.label = label;
                    break;
                case TicketProperty.PRIORITY_ID:
                    field.inputComponent = 'object-reference-input';
                    field.options = [
                        ...field.options,
                        ...this.getObjectReferenceOptions(KIXObjectType.TICKET_PRIORITY)
                    ];
                    field.label = label;
                    break;
                case TicketProperty.LOCK_ID:
                    field.inputComponent = 'default-select-input';
                    const node = await TicketService.getInstance().getTreeNodes(TicketProperty.LOCK_ID);
                    field.options = [
                        new FormFieldOption(
                            DefaultSelectInputFormOption.NODES,
                            node
                        )
                    ];
                    field.label = label;
                    break;
                case TicketProperty.STATE_ID:
                    field.label = label;
                    field.inputComponent = 'object-reference-input';
                    field.options = [
                        ...field.options,
                        ...this.getObjectReferenceOptions(KIXObjectType.TICKET_STATE)
                    ];
                    break;
                default:
            }
        }

        const articleFormService = ServiceRegistry.getServiceInstance<ArticleFormService>(
            KIXObjectType.ARTICLE, ServiceType.FORM
        );
        if (articleFormService && useArticleFormService) {
            formFields = await articleFormService.createFormFieldConfigurations(formFields, false);
        }

        return formFields;
    }

    private getObjectReferenceOptions(objectType: KIXObjectType | string, autocomplete?: boolean): FormFieldOption[] {
        const options = [
            new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType),
            new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, autocomplete),
            new FormFieldOption(FormFieldOptions.SHOW_INVALID, false)
        ];

        if (objectType === KIXObjectType.QUEUE) {
            options.push(new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true));
        }

        if (objectType === KIXObjectType.QUEUE) {
            options.push(
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions(
                        [
                            new FilterCriteria(
                                QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                FilterDataType.STRING, FilterType.AND, null
                            )
                        ],
                        null, null,
                        [QueueProperty.SUB_QUEUES],
                        [QueueProperty.SUB_QUEUES]
                    )
                )
            );
        }

        return options;
    }

}
