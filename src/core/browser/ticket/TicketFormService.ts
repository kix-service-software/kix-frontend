import { KIXObjectFormService } from '../kix/KIXObjectFormService';
import {
    Ticket, KIXObjectType, TicketProperty, Channel, FormField, ArticleProperty,
    FormFieldOptions, FormFieldOption, ContextType, ContextMode, FormContext, FormFieldValue
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

    public async getFormFieldsForChannel(channel: Channel, formId: string): Promise<FormField[]> {
        const fields: FormField[] = [];

        const formInstance = await FormService.getInstance().getFormInstance(formId);

        const customerVisibleReadonly = formInstance.getFormContext() === FormContext.NEW
            && formInstance.getObjectType() !== KIXObjectType.ARTICLE;
        const customerVisibleValue = new FormFieldValue(customerVisibleReadonly ? true : false, true);

        const articleLabelText =
            formInstance.getFormContext() === FormContext.NEW && formInstance.getObjectType() === KIXObjectType.TICKET
                ? 'Translatable#Ticket Description'
                : 'Translatable#Article Text';

        if (channel.Name === 'note') {
            fields.push(new FormField(
                "Translatable#Visible in customer portal", ArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input',
                false, "Translatable#Visible in customer portal", null, customerVisibleValue,
                null, null, null, null, null, null, null, null, null, null, customerVisibleReadonly
            ));
            fields.push(new FormField('Translatable#Subject', ArticleProperty.SUBJECT,
                null, true, 'Translatable#Subject'));
            fields.push(new FormField(
                articleLabelText, ArticleProperty.BODY, 'rich-text-input',
                true, articleLabelText, [
                    new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                        new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                    ]))
                ])
            );
        } else if (channel.Name === 'email') {
            fields.push(new FormField(
                "Translatable#Visible in customer portal", ArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input',
                false, "Translatable#Visible in customer portal", null, customerVisibleValue,
                null, null, null, null, null, null, null, null, null, null, customerVisibleReadonly
            ));

            fields.push(new FormField(
                'Translatable#From', ArticleProperty.FROM, 'article-email-from-input', true, 'Translatable#From'
            ));

            const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (context.getDescriptor().contextMode === ContextMode.CREATE) {
                fields.push(new FormField(
                    'Translatable#Cc', ArticleProperty.CC, 'article-email-recipient-input', false, 'Translatable#Cc', [
                        new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', [ArticleProperty.BCC])
                    ]
                ));
            } else {
                fields.push(new FormField(
                    'Translatable#To', ArticleProperty.TO, 'article-email-recipient-input', false, 'Translatable#To', [
                        new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', [ArticleProperty.CC, ArticleProperty.BCC])
                    ]
                ));
            }

            fields.push(new FormField(
                'Translatable#Subject', ArticleProperty.SUBJECT, null, true, 'Translatable#Subject'
            ));

            fields.push(new FormField(
                articleLabelText, ArticleProperty.BODY, 'rich-text-input', true, articleLabelText
            ));

            fields.push(new FormField(
                'Translatable#Attachments', ArticleProperty.ATTACHMENTS, 'attachment-input',
                false, 'Translatable#Attachments')
            );
        }

        return fields;
    }
}
