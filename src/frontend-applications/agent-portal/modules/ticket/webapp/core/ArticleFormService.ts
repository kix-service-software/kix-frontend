/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
                const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                if (dialogContext) {
                    const isReplyDialog = dialogContext.getAdditionalInformation('ARTICLE_REPLY');
                    if (isReplyDialog) {
                        const referencedArticleId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
                        if (!ticket) {
                            const mainContext = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                            if (mainContext) {
                                ticket = await mainContext.getObject<Ticket>(KIXObjectType.TICKET);
                            }
                        }
                        if (referencedArticleId && ticket) {
                            const referencedArticle = ticket.Articles.find(
                                (a) => a.ArticleID === referencedArticleId
                            );
                            if (referencedArticle) {
                                value = referencedArticle.ChannelID;
                            }
                        }
                    }
                }
                break;
            default:
        }
        return value;
    }

    protected async prepareFormFieldOptions(
        formFields: FormFieldConfiguration[], ticket: Ticket, formContext: FormContext
    ) {
        for (const f of formFields) {
            if (f.property === ArticleProperty.CHANNEL_ID) {
                const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                if (dialogContext) {
                    const isForwardDialog = dialogContext.getAdditionalInformation('ARTICLE_FORWARD');
                    if (isForwardDialog) {
                        const channels = [2];
                        const option = f.options.find((o) => o.option === 'CHANNELS');
                        if (option) {
                            option.value = channels;
                        } else {
                            f.options.push(new FormFieldOption('CHANNELS', channels));
                        }
                    }
                }
            }

            if (f.children) {
                this.prepareFormFieldOptions(f.children, ticket, formContext);
            }
        }
    }

    public async getFormFieldsForChannel(
        channel: Channel, formId: string, clear: boolean = false
    ): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[] = [];

        const formInstance = await FormService.getInstance().getFormInstance(formId);

        let fieldPromises = [];
        if (channel.Name === 'note') {
            fieldPromises = [
                this.getVisibleField(formInstance, clear),
                this.getSubjectField(formInstance, clear),
                this.getBodyField(formInstance, clear),
                this.getAttachmentField(formInstance, clear)
            ];
        } else if (channel.Name === 'email') {
            fieldPromises = [
                this.getVisibleField(formInstance, clear),
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

    private async getVisibleField(formInstance: FormInstance, clear: boolean): Promise<FormFieldConfiguration> {
        const isTicket = formInstance && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() === KIXObjectType.TICKET;
        const defaultValue = new FormFieldValue(null);
        defaultValue.value = true;

        let field = new FormFieldConfiguration(
            'visible-input',
            'Translatable#Show in Customer Portal', ArticleProperty.CUSTOMER_VISIBLE, 'customer-visible-input', false,
            isTicket
                ? 'Translatable#Helptext_Tickets_TicketCreate_CustomerVisible'
                : 'Translatable#Helptext_Tickets_ArticleCreateEdit_CustomerVisible', null, defaultValue
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
            true, helpText, [
            new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
            ]))
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
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        const referencedArticle = dialogContext ? await this.getReferencedArticle(dialogContext) : null;
        if (dialogContext && dialogContext.getDescriptor().contextMode !== ContextMode.CREATE) {
            property = ArticleProperty.TO;
            label = 'Translatable#To';
            actions = [ArticleProperty.CC, ArticleProperty.BCC];
            referencedValue = await this.getToFieldValue(dialogContext);
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

    private async getSubjectFieldValue(): Promise<string> {
        let value;
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
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

    private async getBodyFieldValue(): Promise<string> {
        let value;
        const referencedArticle = await this.getReferencedArticle();
        if (referencedArticle) {
            const fromString = referencedArticle.From.replace(/>/g, '&gt;').replace(/</g, '&lt;');
            const wroteString = await TranslationService.translate('{0} wrote', [fromString]);
            const dateTime = await DateTimeUtil.getLocalDateTimeString(referencedArticle.ChangeTime);
            let articleString = referencedArticle.Body;

            const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(referencedArticle);
            if (prepareContent) {
                articleString = prepareContent[1] ?
                    this.replaceInlineContent(prepareContent[0], prepareContent[1]) : prepareContent[0];
            }
            value = `<p></p>${wroteString} ${dateTime}:`
                + '<div type="cite" style="border-left:2px solid #0a7cb3;padding:10px;">'
                + articleString
                + '</div>';
        }
        return value;
    }

    private async getAttachmentFieldValue(): Promise<Attachment[]> {
        let value = await this.getReferencedValue<Attachment[]>(ArticleProperty.ATTACHMENTS);
        const newValue: Attachment[] = [];
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

    private async getToFieldValue(dialogContext: Context): Promise<string> {
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

    private async getReferencedValue<T = string>(property: string, dialogContext?: Context): Promise<T> {
        let value: T;
        const referencedArticle = await this.getReferencedArticle(dialogContext);
        if (referencedArticle) {
            value = referencedArticle[property];
        }
        return value;
    }

    private async getReferencedArticle(dialogContext?: Context): Promise<Article> {
        let article: Article = null;
        if (!dialogContext) {
            dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        }
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (dialogContext && context) {
            const referencedArticleId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
            const ticket = await context.getObject<Ticket>();
            if (referencedArticleId && ticket) {
                article = ticket.Articles.find((a) => a.ArticleID === referencedArticleId);
            }
        }
        return article;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: CreateTicketArticleOptions,
        formContext?: FormContext
    ): Promise<Array<[string, any]>> {
        await this.addQueueSignature(parameter, createOptions);
        return super.postPrepareValues(parameter, createOptions, formContext);
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
        if (createOptions && createOptions.ticketId) {
            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [createOptions.ticketId], null, null, true
            ).catch(() => [] as Ticket[]);
            return tickets && !!tickets.length ? tickets[0].QueueID : null;
        } else {
            const queueParam = parameter.find((p) => p[0] === TicketProperty.QUEUE_ID);
            return queueParam ? queueParam[1] : null;
        }
    }
}
