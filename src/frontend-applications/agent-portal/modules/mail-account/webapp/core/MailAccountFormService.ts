/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../../../../modules/base-components/webapp/core/KIXObjectFormService";
import { MailAccount } from "../../model/MailAccount";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { FormConfiguration } from "../../../../model/configuration/FormConfiguration";
import { FormFieldValue } from "../../../../model/configuration/FormFieldValue";
import { FormContext } from "../../../../model/configuration/FormContext";
import { MailAccountProperty } from "../../model/MailAccountProperty";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { DispatchingType } from "../../model/DispatchingType";
import { IdService } from "../../../../model/IdService";

export class MailAccountFormService extends KIXObjectFormService {

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

    protected async postPrepareForm(
        form: FormConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount: MailAccount
    ): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
            PAGES:
            for (const p of form.pages) {
                for (const g of p.groups) {
                    for (const f of g.formFields) {
                        if (f.property === MailAccountProperty.TYPE) {
                            const type = formFieldValues.get(f.instanceId).value;
                            if (type && type.match(/^IMAP/)) {
                                await this.setIMAPFolderField(f, formFieldValues, mailAccount);
                            }
                            break PAGES;
                        }
                    }
                }
            }
        }
    }

    private async setIMAPFolderField(
        typeField: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount?: MailAccount
    ): Promise<void> {
        const label = await LabelService.getInstance().getPropertyText(
            MailAccountProperty.IMAP_FOLDER, KIXObjectType.MAIL_ACCOUNT
        );
        const value = typeof mailAccount.IMAPFolder !== 'undefined' && mailAccount.IMAPFolder !== null ?
            mailAccount.IMAPFolder : 'INBOX';
        const folderField = new FormFieldConfiguration(
            'imap-field',
            label, MailAccountProperty.IMAP_FOLDER, null, false,
            'Translatable#Helptext_Admin_MailAccountEdit_IMAPFolder', undefined,
            new FormFieldValue(value)
        );
        folderField.instanceId = IdService.generateDateBasedId(folderField.property);
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

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case MailAccountProperty.DISPATCHING_BY:
                hasPermissions = await this.checkPermissions('system/ticket/queues');
                break;
            default:
        }
        return hasPermissions;
    }

    public async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case MailAccountProperty.TRUSTED:
                value = Number(value);
                break;
            default:
        }
        return [[property, value]];
    }

}
