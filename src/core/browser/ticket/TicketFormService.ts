import { KIXObjectFormService } from '../kix/KIXObjectFormService';
import {
    Ticket, KIXObjectType, TicketProperty, Channel, FormField, ArticleProperty,
    FormFieldOptions, FormFieldOption, ContextType, ContextMode, FormContext, FormFieldValue, IFormInstance
} from '../../model';
import { PendingTimeFormValue } from './form';
import { AutocompleteOption, AutocompleteFormFieldOption } from '../components';
import { ContextService } from '../context';
import { FormService } from "../form";

export class TicketFormService extends KIXObjectFormService<Ticket> {

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
        return kixObjectType === KIXObjectType.TICKET || kixObjectType === KIXObjectType.ARTICLE;
    }

    protected async getValue(property: string, value: any, ticket: Ticket): Promise<any> {
        if (value) {
            switch (property) {
                case TicketProperty.STATE_ID:
                    if (ticket) {
                        value = new PendingTimeFormValue(
                            value,
                            ticket[TicketProperty.PENDING_TIME] ? true : false,
                            ticket[TicketProperty.PENDING_TIME] ? new Date(ticket[TicketProperty.PENDING_TIME]) : null
                        );
                    }
                    break;
                default:
            }
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
        let field = new FormField('Translatable#Subject', ArticleProperty.SUBJECT, undefined, true,
            'Translatable#Subject'
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.SUBJECT);
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

    private async getBodyField(formInstance: IFormInstance, clear: boolean): Promise<FormField> {
        const articleLabelText = formInstance && formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() === KIXObjectType.TICKET
            ? 'Translatable#Ticket Description'
            : 'Translatable#Article Text';

        let field = new FormField(
            articleLabelText, ArticleProperty.BODY, 'rich-text-input',
            true, articleLabelText, [
                new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                    new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                ]))
            ]
        );
        if (!clear && formInstance) {
            const existingField = await formInstance.getFormFieldByProperty(ArticleProperty.BODY);
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
        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (context && context.getDescriptor().contextMode !== ContextMode.CREATE) {
            property = ArticleProperty.TO;
            label = 'Translatable#To';
            actions = [ArticleProperty.CC, ArticleProperty.BCC];
        }

        let field = new FormField(
            label, property, 'article-email-recipient-input', false, label, [
                new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', actions)
            ]
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
}
