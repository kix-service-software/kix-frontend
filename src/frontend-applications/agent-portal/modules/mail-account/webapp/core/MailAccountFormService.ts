/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { MailAccount } from '../../model/MailAccount';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormContext } from '../../../../model/configuration/FormContext';
import { MailAccountProperty } from '../../model/MailAccountProperty';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { DispatchingType } from '../../model/DispatchingType';
import { IdService } from '../../../../model/IdService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../base-components/webapp/core/InputFieldTypes';

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

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.MAIL_ACCOUNT;
    }

    protected async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, mailAccount: MailAccount
    ): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
            PAGES:
            for (const p of form.pages) {
                for (const g of p.groups) {
                    for (const f of g.formFields) {
                        if (f.property === MailAccountProperty.TYPE) {
                            const type = formFieldValues.get(f.instanceId).value;
                            if (type?.match(/OAuth2/)) {
                                await this.setProfileField(f, formFieldValues, mailAccount);
                            } else if (type) {
                                await this.setPasswordField(f, formFieldValues, mailAccount);
                            }
                            if (type?.match(/^IMAP/)) {
                                await this.setIMAPFolderField(f, formFieldValues, mailAccount);
                            }
                            break PAGES;
                        }
                    }
                }
            }
        }
    }

    private async setPasswordField(
        typeField: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount?: MailAccount
    ): Promise<void> {
        const value = mailAccount ? 'not modified' : undefined;
        const passwordField = await this.getPasswordField();
        typeField.children.push(passwordField);
        formFieldValues.set(passwordField.instanceId, new FormFieldValue(value));
    }

    public async getPasswordField(): Promise<FormFieldConfiguration> {
        const passwordField = new FormFieldConfiguration(
            'password-field',
            'Translatable#Password', MailAccountProperty.PASSWORD, null, true,
            'Translatable#Helptext_Admin_MailAccountCreate_Password',
            [
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
            ]
        );
        passwordField.instanceId = IdService.generateDateBasedId(passwordField.property);
        return passwordField;
    }

    private async setIMAPFolderField(
        typeField: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount?: MailAccount
    ): Promise<void> {
        const value = typeof mailAccount?.IMAPFolder !== 'undefined' && mailAccount?.IMAPFolder !== null ?
            mailAccount.IMAPFolder : 'INBOX';
        const folderField = await this.getFolderField();
        typeField.children.push(folderField);
        formFieldValues.set(folderField.instanceId, new FormFieldValue(value));
    }

    public async getFolderField(): Promise<FormFieldConfiguration> {
        const label = await LabelService.getInstance().getPropertyText(
            MailAccountProperty.IMAP_FOLDER, KIXObjectType.MAIL_ACCOUNT
        );
        const folderField = new FormFieldConfiguration(
            'imap-field',
            label, MailAccountProperty.IMAP_FOLDER, null, false,
            'Translatable#Helptext_Admin_MailAccountCreate_IMAPFolder', undefined
        );
        folderField.instanceId = IdService.generateDateBasedId(folderField.property);
        return folderField;
    }

    private async setProfileField(
        typeField: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount?: MailAccount
    ): Promise<void> {
        const value = typeof mailAccount?.OAuth2_ProfileID !== 'undefined' && mailAccount?.OAuth2_ProfileID !== null ?
            mailAccount.OAuth2_ProfileID : undefined;
        const profileField = await this.getProfileField();
        typeField.children.push(profileField);
        formFieldValues.set(profileField.instanceId, new FormFieldValue(value));
    }

    public async getProfileField(): Promise<FormFieldConfiguration> {
        const label = await LabelService.getInstance().getPropertyText(
            MailAccountProperty.OAUTH2_PROFILEID, KIXObjectType.MAIL_ACCOUNT
        );
        const profileField = new FormFieldConfiguration(
            'oauth2-profile-field',
            label, MailAccountProperty.OAUTH2_PROFILEID, 'object-reference-input',
            true, 'Translatable#Helptext_Admin_MailAccountCreate_OAuth2_Profile',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.OAUTH2_PROFILE),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, false),
                new FormFieldOption(ObjectReferenceOptions.TRANSLATABLE, false),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true)
            ]
        );
        profileField.instanceId = IdService.generateDateBasedId(profileField.property);
        return profileField;
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

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case MailAccountProperty.TRUSTED:
                value = Number(value);
                break;
            default:
        }
        return [[property, value]];
    }

}
