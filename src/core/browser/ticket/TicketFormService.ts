import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import {
    Ticket, KIXObjectType, TicketProperty, Channel, FormField, ArticleProperty,
    FormFieldOptions, FormFieldOption, ContextType, ContextMode
} from "../../model";
import { PendingTimeFormValue } from "./form";
import { ContactService } from "../contact";
import { CustomerService } from "../customer";
import { AutocompleteOption, AutocompleteFormFieldOption } from "../components";
import { ContextService } from "../context";

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

    public getFormFieldsForChannel(channel: Channel): FormField[] {
        const fields: FormField[] = [];

        if (channel.Name === 'note') {
            fields.push(new FormField(
                "Sichtbar in Kundenportal", ArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input',
                false, "Sichtbar im Kundenportal"
            ));
            fields.push(new FormField("Betreff", ArticleProperty.SUBJECT, null, true, "Betreff"));
            fields.push(new FormField(
                "Artikelinhalt", ArticleProperty.BODY, 'rich-text-input', true, "Beschreibung", [
                    new FormFieldOption(FormFieldOptions.AUTO_COMPLETE, new AutocompleteFormFieldOption([
                        new AutocompleteOption(KIXObjectType.TEXT_MODULE, '::')
                    ]))
                ])
            );
            fields.push(new FormField("Anlagen", ArticleProperty.ATTACHMENTS, 'attachment-input', false, "Anlagen"));
        } else if (channel.Name === "email") {
            fields.push(new FormField(
                "Sichtbar in Kundenportal", ArticleProperty.CUSTOMER_VISIBLE, 'checkbox-input',
                false, "Sichtbar im Kundenportal",
                null, null, null, null, null, null, null, null, null, null, null, null, true
            ));

            fields.push(new FormField(
                "Von", ArticleProperty.FROM, 'article-email-from-input', true, "Von"
            ));

            const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (context.getDescriptor().contextMode === ContextMode.CREATE) {
                fields.push(new FormField(
                    "Cc", ArticleProperty.CC, 'article-email-recipient-input', false, "Cc", [
                        new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', [ArticleProperty.BCC])
                    ]
                ));
            } else {
                fields.push(new FormField(
                    "An", ArticleProperty.TO, 'article-email-recipient-input', false, "An", [
                        new FormFieldOption('ADDITIONAL_RECIPIENT_TYPES', [ArticleProperty.CC, ArticleProperty.BCC])
                    ]
                ));
            }

            fields.push(new FormField(
                "Betreff", ArticleProperty.SUBJECT, null, true, "Betreff"
            ));

            fields.push(new FormField(
                "Inhalt", ArticleProperty.BODY, 'rich-text-input', true, "Inhalt"
            ));

            fields.push(new FormField("Anlagen", ArticleProperty.ATTACHMENTS, 'attachment-input', false, "Anlagen"));
        }


        return fields;
    }
}
