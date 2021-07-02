/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { Article } from '../../model/Article';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Ticket } from '../../model/Ticket';
import { ArticleProperty } from '../../model/ArticleProperty';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../model/ContextType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { Channel } from '../../model/Channel';
import { FormService } from '../../../../modules/base-components/webapp/core/FormService';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { AutocompleteFormFieldOption } from '../../../../model/AutocompleteFormFieldOption';
import { AutocompleteOption } from '../../../../model/AutocompleteOption';
import { Attachment } from '../../../../model/kix/Attachment';
import { ContextMode } from '../../../../model/ContextMode';
import { TicketService } from '.';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { Context } from 'vm';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../../system-address/model/SystemAddress';
import { TicketParameterUtil } from './TicketParameterUtil';
import { CreateTicketArticleOptions } from '../../model/CreateTicketArticleOptions';
import { TicketProperty } from '../../model/TicketProperty';
import { Queue } from '../../model/Queue';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { TicketFormService } from './TicketFormService';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ArticleLoadingOptions } from '../../model/ArticleLoadingOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';

export class ArticleFormService extends KIXObjectFormService {

    private static INSTANCE: ArticleFormService = null;

    public static getInstance(): ArticleFormService {
        if (!ArticleFormService.INSTANCE) {
            ArticleFormService.INSTANCE = new ArticleFormService();
        }

        return ArticleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.ARTICLE;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value);
    }

    protected async getValue(property: string, value: any, ticket?: Ticket): Promise<any> {
        switch (property) {
            case ArticleProperty.CHANNEL_ID:
                const dialogContext = ContextService.getInstance().getActiveContext();
                if (dialogContext) {
                    const isReplyDialog = dialogContext.getAdditionalInformation('ARTICLE_REPLY');
                    if (isReplyDialog) {
                        const referencedArticle = await this.getReferencedArticle(dialogContext, ticket);
                        if (referencedArticle) {
                            value = referencedArticle.ChannelID;
                        }
                    } else {
                        const isForwardDialog = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
                        if (isForwardDialog) {
                            value = 2;
                        } else {
                            value ||= 1;
                        }
                    }
                }
                break;
            default:
        }
        return value;
    }

    protected async prePrepareForm(
        form: FormConfiguration, ticket: Ticket, formInstance: FormInstance
    ) {
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {
            const isForwardDialog = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
            if (isForwardDialog) {
                PAGES:
                for (const p of form.pages) {
                    for (const g of p.groups) {
                        for (const f of g.formFields) {
                            if (f.property === ArticleProperty.CHANNEL_ID) {
                                const channels = [2];
                                const option = f.options.find((o) => o.option === 'CHANNELS');
                                if (option) {
                                    option.value = channels;
                                } else {
                                    f.options.push(new FormFieldOption('CHANNELS', channels));
                                }
                            }
                        }
                        break PAGES;
                    }
                }
            }
        }
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {
        const value = await formInstance.getFormFieldValueByProperty<number>(ArticleProperty.CHANNEL_ID);
        if (value && value.value) {
            const channelFields = await this.getFormFieldsForChannel(
                formInstance, value.value, form.id, true
            );

            const field = formInstance.getFormFieldByProperty(ArticleProperty.CHANNEL_ID);
            formInstance.addFieldChildren(field, channelFields, true);
        }
    }

    public async getFormFieldsForChannel(
        formInstance: FormInstance, channelId: number, formId: string, clear: boolean = false
    ): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[] = [];

        const channels = await KIXObjectService.loadObjects<Channel>(KIXObjectType.CHANNEL, [channelId])
            .catch((): Channel[] => []);
        const channel = Array.isArray(channels) && channels.length ? channels[0] : null;

        let fieldPromises = [];
        if (channel?.Name === 'note') {
            fieldPromises = [
                this.getCustomerVisibleField(formInstance, clear),
                this.getSubjectField(formInstance, clear),
                this.getBodyField(formInstance, clear),
                this.getAttachmentField(formInstance, clear)
            ];

            formInstance.provideFormFieldValuesForProperties([
                [ArticleProperty.TO, null],
                [ArticleProperty.CC, null],
                [ArticleProperty.BCC, null],
            ], null);
        } else if (channel?.Name === 'email') {
            fieldPromises = [
                this.getCustomerVisibleField(formInstance, clear),
                this.getFromField(formInstance, clear),
                this.getToOrCcField(formInstance, clear),
                this.getSubjectField(formInstance, clear),
                this.getBodyField(formInstance, clear),
                this.getAttachmentField(formInstance, clear)
            ];
        }

        await Promise.all(fieldPromises).then((newFields: FormFieldConfiguration[]) => {
            fields = newFields.filter((nf) => typeof nf !== 'undefined' && nf !== null);
        });

        return fields;
    }

    private async getCustomerVisibleField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        const isNewTicketContext = formInstance
            && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() === KIXObjectType.TICKET;
        const defaultValue = new FormFieldValue(true);

        const hint = isNewTicketContext
            ? 'Translatable#Helptext_Tickets_TicketCreate_CustomerVisible'
            : 'Translatable#Helptext_Tickets_ArticleCreateEdit_CustomerVisible';

        let field = new FormFieldConfiguration(
            'visible-input',
            'Translatable#Show in Customer Portal', ArticleProperty.CUSTOMER_VISIBLE, 'customer-visible-input', false,
            hint, null, defaultValue
        );

        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(ArticleProperty.CUSTOMER_VISIBLE);
            if (existingField) {
                field = existingField;
                const value = formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getSubjectField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        const isTicket = formInstance && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() === KIXObjectType.TICKET;
        const referencedValue = await this.getSubjectFieldValue();
        let field = new FormFieldConfiguration(
            'subject-input',
            'Translatable#Subject', ArticleProperty.SUBJECT, undefined, true,
            isTicket
                ? 'Translatable#Helptext_Tickets_TicketCreate_Subject'
                : 'Translatable#Helptext_Tickets_ArticleCreateEdit_Subject',
            null, referencedValue ? new FormFieldValue(referencedValue) : null
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(ArticleProperty.SUBJECT);
            if (existingField) {
                field = existingField;
                const value = formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getBodyField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        const isTicket = formInstance && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() === KIXObjectType.TICKET;

        const articleLabelText = isTicket
            ? 'Translatable#Ticket Description'
            : 'Translatable#Article Text';

        const helpText = isTicket
            ? 'Translatable#Helptext_Tickets_TicketCreate_Body'
            : 'Translatable#Helptext_Tickets_ArticleCreateEdit_Body';

        const referencedValue = await this.getBodyFieldValue();

        let field = new FormFieldConfiguration(
            'body-input',
            articleLabelText, ArticleProperty.BODY, 'rich-text-input',
            true, helpText,
            [
                new FormFieldOption(
                    FormFieldOptions.AUTO_COMPLETE,
                    new AutocompleteFormFieldOption(
                        [
                            new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                        ]
                    )
                )
            ], referencedValue ? new FormFieldValue(referencedValue) : null
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(ArticleProperty.BODY);
            if (existingField) {
                field = existingField;
                const value = formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getAttachmentField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        const referencedValue = await this.getAttachmentFieldValue();

        let field = new FormFieldConfiguration(
            'attachment-input',
            'Translatable#Attachments', ArticleProperty.ATTACHMENTS, 'attachment-input', false,
            'Translatable#Helptext_Tickets_ArticleCreate_Attachments',
            null, referencedValue ? new FormFieldValue(referencedValue) : null
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(ArticleProperty.ATTACHMENTS);
            if (existingField) {
                field = existingField;
                const value = formInstance.getFormFieldValue<Attachment[]>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getFromField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        let field = new FormFieldConfiguration(
            'from-input',
            'Translatable#From', ArticleProperty.FROM, 'article-email-from-input', true,
            'Translatable#Helptext_Tickets_ArticleCreate_From'
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(ArticleProperty.FROM);
            if (existingField) {
                field = existingField;
                const value = formInstance.getFormFieldValue(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getToOrCcField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        let property = ArticleProperty.CC;
        let label = 'Translatable#Cc';
        let actions = [ArticleProperty.BCC];
        let referencedValue;
        const dialogContext = ContextService.getInstance().getActiveContext();
        const referencedArticle = dialogContext ? await this.getReferencedArticle(dialogContext) : null;
        if (dialogContext && dialogContext.descriptor.contextMode !== ContextMode.CREATE) {
            property = ArticleProperty.TO;
            label = 'Translatable#To';
            actions = [ArticleProperty.CC, ArticleProperty.BCC];
            const toValue = await this.getToFieldValue(dialogContext);
            referencedValue = toValue ? [toValue] : null;
        }

        let field = new FormFieldConfiguration(
            'recipient-input',
            label, property, 'article-email-recipient-input', !!referencedArticle || property === ArticleProperty.TO,
            property === ArticleProperty.TO
                ? 'Translatable#Helptext_Tickets_ArticleCreate_ReceiverTo'
                : 'Translatable#Helptext_Tickets_ArticleCreate_ReceiverCc',
            [
                new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', actions)
            ], referencedValue ? new FormFieldValue(referencedValue) : null
        );
        if (!clear && formInstance) {
            const existingField = formInstance.getFormFieldByProperty(property);
            if (existingField) {
                field = existingField;
                const value = formInstance.getFormFieldValue(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    public async getSubjectFieldValue(): Promise<string> {
        let value;
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {
            value = await this.getReferencedValue(ArticleProperty.SUBJECT, dialogContext);
            if (value) {
                const isReplyDialog = dialogContext.getAdditionalInformation('ARTICLE_REPLY');
                const isForwardDialog = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
                if (isReplyDialog) {
                    const subjectConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                        KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_SUBJECT_RE], null, null, true
                    ).catch((error): SysConfigOption[] => []);
                    value = `${subjectConfig && subjectConfig.length ? subjectConfig[0].Value : 'RE'}: ${value}`;
                } else if (isForwardDialog) {
                    const subjectConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
                        KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_SUBJECT_FW], null, null, true
                    ).catch((error): SysConfigOption[] => []);
                    value = `${subjectConfig && subjectConfig.length ? subjectConfig[0].Value : 'FW'}: ${value}`;
                }
            }
        }
        return value;
    }

    public async getBodyFieldValue(): Promise<string> {
        let value: string;
        const referencedArticle = await this.getReferencedArticle();
        if (referencedArticle) {
            const fromString = referencedArticle.From.replace(/>/g, '&gt;').replace(/</g, '&lt;');
            const wroteString = await TranslationService.translate('{0} wrote', [fromString]);
            const dateTime = await DateTimeUtil.getLocalDateTimeString(referencedArticle.ChangeTime);
            let articleString = referencedArticle.Body;

            const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(referencedArticle);
            if (prepareContent) {
                articleString = BrowserUtil.replaceInlineContent(prepareContent[0], prepareContent[1]);
            }
            value = `<p></p>${wroteString} ${dateTime}:`
                + '<div type="cite" style="border-left:2px solid #0a7cb3;padding:10px;">'
                + articleString
                + '</div>';
        }
        return value;
    }

    public async getAttachmentFieldValue(): Promise<Attachment[]> {
        let value;
        const newValue: Attachment[] = [];

        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {
            const isForwardDialog = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
            if (isForwardDialog) {
                value = await this.getReferencedValue<Attachment[]>(ArticleProperty.ATTACHMENTS);
            }
        }

        if (Array.isArray(value)) {
            value = value.filter((a) => a.Disposition !== 'inline');
            if (!!value.length) {
                // TODO: not very performant (maybe some reference attachment id)
                const referencedArticle = await this.getReferencedArticle();
                for (const attachment of value) {
                    const attachmentWithContent = await TicketService.getInstance().loadArticleAttachment(
                        referencedArticle.TicketID, referencedArticle.ArticleID, attachment.ID
                    );
                    if (attachmentWithContent) {
                        newValue.push(attachmentWithContent);
                    }
                }
            }
        }
        return !!newValue.length ? newValue : null;
    }

    public async getToFieldValue(dialogContext: Context): Promise<string> {
        let value;
        const isReplyDialog = dialogContext.getAdditionalInformation('ARTICLE_REPLY');
        if (isReplyDialog) {
            value = await this.getReferencedValue(ArticleProperty.FROM, dialogContext);
            if (value) {
                const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS
                );
                if (systemAddresses.some((sa) => sa.Name === value.replace(/.+ <(.+)>/, '$1'))) {
                    value = null;
                }
            }
        }
        return value;
    }

    public async getReferencedValue<T = string>(property: string, dialogContext?: Context): Promise<T> {
        let value: T;
        const referencedArticle = await this.getReferencedArticle(
            dialogContext, undefined, property === ArticleProperty.ATTACHMENTS
        );
        if (referencedArticle) {
            value = referencedArticle[property];
        }
        return value;
    }

    public async getReferencedArticle(
        dialogContext?: Context, ticket?: Ticket, withAttachments?: boolean
    ): Promise<Article> {
        let article: Article = null;
        if (!dialogContext) {
            dialogContext = ContextService.getInstance().getActiveContext();
        }
        if (dialogContext) {
            const referencedArticleId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
            if (referencedArticleId) {
                let articles: Article[] = ticket ? ticket.Articles : [];
                if (!Array.isArray(articles) || !articles.length) {

                    // "KIX-Start mode"
                    const referencedTicketId = dialogContext.getAdditionalInformation('REFERENCED_TICKET_ID');
                    if (referencedTicketId) {
                        let loadingOptions;
                        if (withAttachments) {
                            loadingOptions = new KIXObjectLoadingOptions(
                                undefined, undefined, undefined,
                                [ArticleProperty.ATTACHMENTS]
                            );
                        }
                        articles = await KIXObjectService.loadObjects<Article>(
                            KIXObjectType.ARTICLE, [referencedArticleId], loadingOptions,
                            new ArticleLoadingOptions(referencedTicketId), true
                        ).catch(() => [] as Article[]);
                    }

                    // "KIX Pro mode"
                    else {
                        const context = ContextService.getInstance().getActiveContext();
                        if (context) {
                            articles = await context.getObjectList<Article>(KIXObjectType.ARTICLE);
                        }
                    }
                }
                article = articles.find((a) => a.ArticleID === referencedArticleId);
            }
        }
        return article;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: CreateTicketArticleOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<Array<[string, any]>> {
        await this.addQueueSignature(parameter, createOptions);
        return super.postPrepareValues(parameter, createOptions, formContext, formInstance);
    }

    public async addQueueSignature(
        parameter: Array<[string, any]>, createOptions?: CreateTicketArticleOptions
    ): Promise<void> {
        const articleBodyParam = parameter.find((p) => p[0] === ArticleProperty.BODY);
        const channelParam = parameter.find((p) => p[0] === ArticleProperty.CHANNEL_ID);
        if (articleBodyParam && channelParam && channelParam[1]) {
            const channels = await KIXObjectService.loadObjects<Channel>(
                KIXObjectType.CHANNEL, [channelParam[1]], null, null, true
            ).catch(() => []);
            if (channels && channels[0] && channels[0].Name === 'email') {
                const queueId = await this.getQueueID(createOptions, parameter);
                if (queueId) {
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [queueId], null, null, true
                    );
                    const queue = queues && !!queues.length ? queues[0] : null;
                    if (queue && queue.Signature) {
                        articleBodyParam[1] += `\n\n${queue.Signature}`;
                    }
                }
            }
        }
    }

    private async getQueueID(
        createOptions: CreateTicketArticleOptions, parameter: Array<[string, any]>
    ): Promise<number> {
        let queueId = null;
        const queueParam = parameter.find((p) => p[0] === TicketProperty.QUEUE_ID);
        if (queueParam && queueParam[1]) {
            queueId = queueParam[1];
        } else {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                const ticket = context.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
                queueId = ticket ? ticket.QueueID : null;
            }
        }
        if (!queueId && createOptions && createOptions.ticketId) {
            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [createOptions.ticketId], null, null, true
            ).catch(() => [] as Ticket[]);
            queueId = tickets && !!tickets.length ? tickets[0].QueueID : null;
        }
        return queueId;
    }

    public async createFormFieldConfigurations(
        formFields: FormFieldConfiguration[], useTicketFormService: boolean = true
    ): Promise<FormFieldConfiguration[]> {
        const filterProperties = [
            ArticleProperty.TO,
            ArticleProperty.CC,
            ArticleProperty.BCC,
            ArticleProperty.FROM,
            ArticleProperty.BODY,
            ArticleProperty.SUBJECT,
            ArticleProperty.ATTACHMENTS,
            ArticleProperty.CUSTOMER_VISIBLE
        ];
        formFields = formFields.filter((f) => !filterProperties.some((fp) => f.property === fp));
        for (const field of formFields) {
            const label = await LabelService.getInstance().getPropertyText(field.property, KIXObjectType.ARTICLE);

            switch (field.property) {
                case ArticleProperty.FROM:
                    field.inputComponent = 'article-email-from-input';
                    field.label = label;
                    break;
                case ArticleProperty.TO:
                case ArticleProperty.CC:
                case ArticleProperty.BCC:
                    field.inputComponent = 'article-email-recipient-input';
                    field.label = label;
                    break;
                case ArticleProperty.BODY:
                    field.inputComponent = 'rich-text-input';
                    field.options = [
                        new FormFieldOption(
                            FormFieldOptions.AUTO_COMPLETE,
                            new AutocompleteFormFieldOption(
                                [
                                    new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                                ]
                            )
                        )
                    ];
                    field.label = label;
                case ArticleProperty.ATTACHMENTS:
                    field.inputComponent = 'attachment-input';
                    field.label = label;
                    break;
                case ArticleProperty.CHANNEL_ID:
                    field.inputComponent = 'channel-input';
                    field.options = [
                        new FormFieldOption('NO_CHANNEL', true)
                    ];
                    field.label = label;
                    break;
                case ArticleProperty.CUSTOMER_VISIBLE:
                    field.inputComponent = 'customer-visible-input';
                    field.label = label;
                    break;
                default:
            }
        }

        const ticketFormService = ServiceRegistry.getServiceInstance<TicketFormService>(
            KIXObjectType.TICKET, ServiceType.FORM
        );
        if (ticketFormService && useTicketFormService) {
            formFields = await ticketFormService.createFormFieldConfigurations(formFields, false);
        }

        return formFields;
    }
}
