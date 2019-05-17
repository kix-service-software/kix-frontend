import { KIXObjectFormService } from '../kix/KIXObjectFormService';
import {
    KIXObjectType, Channel, FormField, ArticleProperty,
    FormFieldOptions, FormFieldOption, ContextType, ContextMode, FormContext, FormFieldValue, IFormInstance,
    Article, Ticket, Context, SystemAddress, DateTimeUtil
} from '../../model';
import { AutocompleteOption, AutocompleteFormFieldOption } from '../components';
import { ContextService } from '../context';
import { FormService } from "../form";
import { TicketService } from './TicketService';
import { KIXObjectService } from '../kix';
import { TranslationService } from '../i18n/TranslationService';

export class ArticleFormService extends KIXObjectFormService<Article> {

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

    protected async getValue(property: string, value: any, ticket: Ticket): Promise<any> {
        switch (property) {
            case ArticleProperty.CHANNEL_ID:
                if (ticket) {
                    const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                    if (dialogContext) {
                        const referencedArticleId = dialogContext.getAdditionalInformation('REFERENCED_ARTICLE_ID');
                        if (referencedArticleId && ticket) {
                            const referencedArticle = ticket.Articles.find((a) => a.ArticleID === referencedArticleId);
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

    public async getFormFieldsForChannel(
        channel: Channel, formId: string, clear: boolean = false
    ): Promise<FormField[]> {
        const fields: FormField[] = [];

        const formInstance = await FormService.getInstance().getFormInstance(formId);

        if (channel.Name === 'note') {
            fields.push(await this.getVisibleField(formInstance, clear));
            fields.push(await this.getSubjectField(formInstance, clear));
            fields.push(await this.getBodyField(formInstance, clear));
            fields.push(await this.getAttachmentField(formInstance, clear));
        } else if (channel.Name === 'email') {
            fields.push(await this.getVisibleField(formInstance, clear));
            fields.push(await this.getFromField(formInstance, clear));
            fields.push(await this.getToOrCcField(formInstance, clear));
            fields.push(await this.getSubjectField(formInstance, clear));
            fields.push(await this.getBodyField(formInstance, clear));
            fields.push(await this.getAttachmentField(formInstance, clear));
        }

        return fields;
    }

    private async getVisibleField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        const customerVisibleReadonly = formInstance && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() !== KIXObjectType.ARTICLE;
        const customerVisibleValue = new FormFieldValue(customerVisibleReadonly ? true : false, true);

        let field = new FormField(
            "Translatable#Visible in customer portal", ArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input',
            false, "Translatable#Visible in customer portal", undefined, customerVisibleValue,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, customerVisibleReadonly
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.CUSTOMER_VISIBLE);
            if (existingField) {
                field = existingField;
                const value = await formInstance.getFormFieldValue<boolean>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getSubjectField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        let defaultValue = await this.getDefaultValue(ArticleProperty.SUBJECT);
        if (defaultValue) {
            defaultValue = `RE: ${defaultValue}`;
        }
        let field = new FormField(
            'Translatable#Subject', ArticleProperty.SUBJECT, undefined, true,
            'Translatable#Subject', null, defaultValue ? new FormFieldValue(defaultValue) : null
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.SUBJECT);
            if (existingField) {
                field = existingField;
                const value = await formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getBodyField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        const articleLabelText = formInstance && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() === KIXObjectType.TICKET
            ? 'Translatable#Ticket Description'
            : 'Translatable#Article Text';

        let defaultValue;
        const referencedArticle = await this.getReferencedArticle();
        if (referencedArticle) {
            const prepareContent = await TicketService.getInstance().getPreparedArticleBodyContent(referencedArticle);
            if (prepareContent && prepareContent[1]) {
                const fromString = referencedArticle.From.replace(/>/g, '&gt;').replace(/</g, '&lt;');
                const wroteString = await TranslationService.translate('{0} wrote', [fromString]);
                const dateTime = await DateTimeUtil.getLocalDateTimeString(referencedArticle.ChangeTime);
                defaultValue = `<p></p>${wroteString} ${dateTime}:`
                    + '<div type="cite" style="border-left:2px solid #0a7cb3;padding:10px;">'
                    + this.replaceInlineContent(prepareContent[0], prepareContent[1])
                    + '</div>';
            }
        }

        let field = new FormField(
            articleLabelText, ArticleProperty.BODY, 'rich-text-input',
            true, articleLabelText, [
                new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                    new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                ]))
            ], defaultValue ? new FormFieldValue(defaultValue) : null
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.BODY);
            if (existingField) {
                field = existingField;
                const value = await formInstance.getFormFieldValue<string>(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getAttachmentField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        let field = new FormField(
            'Translatable#Attachments', ArticleProperty.ATTACHMENTS, 'attachment-input', false,
            'Translatable#Attachments'
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.ATTACHMENTS);
            if (existingField) {
                field = existingField;
                const value = await formInstance.getFormFieldValue(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getFromField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        let field = new FormField(
            'Translatable#From', ArticleProperty.FROM, 'article-email-from-input', true, 'Translatable#From'
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.FROM);
            if (existingField) {
                field = existingField;
                const value = await formInstance.getFormFieldValue(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getToOrCcField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        let property = ArticleProperty.CC;
        let label = 'Translatable#Cc';
        let actions = [ArticleProperty.BCC];
        let defaultValue;
        const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        const referencedArticle = dialogContext ? await this.getReferencedArticle(dialogContext) : null;
        if (dialogContext && dialogContext.getDescriptor().contextMode !== ContextMode.CREATE) {
            property = ArticleProperty.TO;
            label = 'Translatable#To';
            actions = [ArticleProperty.CC, ArticleProperty.BCC];
            defaultValue = await this.getDefaultValue(ArticleProperty.FROM, dialogContext);
            if (defaultValue) {
                const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS
                );
                if (systemAddresses.some((sa) => sa.Name === defaultValue.replace(/.+ <(.+)>/, '$1'))) {
                    defaultValue = null;
                }
            }
        }

        let field = new FormField(
            label, property, 'article-email-recipient-input', referencedArticle ? true : false, label, [
                new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', actions)
            ], defaultValue ? new FormFieldValue(defaultValue) : null
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(property);
            if (existingField) {
                field = existingField;
                const value = await formInstance.getFormFieldValue(existingField.instanceId);
                if (value) {
                    field.defaultValue = value;
                }
            }
        }
        return field;
    }

    private async getDefaultValue(property: string, dialogContext?: Context): Promise<string> {
        let value: string = null;
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
}
