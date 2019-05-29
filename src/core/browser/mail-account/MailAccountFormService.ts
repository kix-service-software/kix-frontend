import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import {
    KIXObjectType, MailAccount, FormFieldValue, Form, MailAccountProperty, FormField, DispatchingType
} from "../../model";
import { ContextService } from "../context";
import { MailAccountDetailsContext } from "./context";
import { LabelService } from "../LabelService";

export class MailAccountFormService extends KIXObjectFormService<MailAccount> {

    private static INSTANCE: MailAccountFormService = null;

    public static getInstance(): MailAccountFormService {
        if (!MailAccountFormService.INSTANCE) {
            MailAccountFormService.INSTANCE = new MailAccountFormService();
        }

        return MailAccountFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.MAIL_ACCOUNT;
    }

    public async initValues(form: Form): Promise<Map<string, FormFieldValue<any>>> {
        const formFieldValues = await super.initValues(form);

        const context = await ContextService.getInstance().getContext<MailAccountDetailsContext>(
            MailAccountDetailsContext.CONTEXT_ID
        );

        if (context) {
            const mailAccount = await context.getObject<MailAccount>();
            groupLoop: for (const g of form.groups) {
                for (const f of g.formFields) {
                    if (f.property === MailAccountProperty.TYPE) {
                        const type = formFieldValues.get(f.instanceId).value;
                        if (type && type.match(/^IMAP/)) {
                            await this.setIMAPFolderField(f, formFieldValues, mailAccount);
                        }
                        break groupLoop;
                    }
                }
            }
        }

        return formFieldValues;
    }

    private async setIMAPFolderField(
        typeField: FormField, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount?: MailAccount
    ): Promise<void> {
        const label = await LabelService.getInstance().getPropertyText(
            MailAccountProperty.IMAP_FOLDER, KIXObjectType.MAIL_ACCOUNT
        );
        const value = typeof mailAccount.IMAPFolder !== 'undefined' && mailAccount.IMAPFolder !== null ?
            mailAccount.IMAPFolder : 'INBOX';
        const folderField = new FormField(
            label, MailAccountProperty.IMAP_FOLDER, null, false,
            'Translatable#Helptext_Admin_MailAccountEdit_IMAPFolder', undefined,
            new FormFieldValue(value)
        );
        typeField.children.push(folderField);
        formFieldValues.set(folderField.instanceId, new FormFieldValue(value));
    }

    protected async getValue(property: string, value: any, mailAccount: MailAccount): Promise<any> {
        switch (property) {
            case MailAccountProperty.DISPATCHING_BY:
                if (value === DispatchingType.BACKEND_KEY_DEFAULT) {
                    value = DispatchingType.FRONTEND_KEY_DEFAULT;
                } else {
                    value = mailAccount ? mailAccount.QueueID : null;
                }
                break;
            default:
        }
        return value;
    }

}
