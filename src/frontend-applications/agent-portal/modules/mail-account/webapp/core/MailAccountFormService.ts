/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';

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
                        }
                        else if (f.property === MailAccountProperty.DISPATCHING_BY) {
                            const dispatch = formFieldValues.get(f.instanceId).value;
                            if (dispatch?.match(/^Queue$/)) {
                                await this.setQueueField(f, formFieldValues, mailAccount);
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

    private async setQueueField(
        typeField: FormFieldConfiguration, formFieldValues: Map<string, FormFieldValue<any>>, mailAccount?: MailAccount
    ): Promise<void> {
        const value = mailAccount.DispatchingBy === DispatchingType.BACKEND_KEY_QUEUE
            && mailAccount.QueueID !== null ? mailAccount.QueueID : undefined;
        const queueField = await this.getQueueField();
        typeField.children.push(queueField);
        formFieldValues.set(queueField.instanceId, new FormFieldValue(value));
    }

    public async getQueueField(): Promise<FormFieldConfiguration> {
        const queueField = new FormFieldConfiguration(
            'dispatch-queue-field',
            'Translatable#Queue', MailAccountProperty.QUEUE_ID, 'object-reference-input', true,
            'Translatable#Helptext_Admin_MailAccountCreate_Dispatching_Queue',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                    new KIXObjectLoadingOptions([
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        )
                    ])
                ),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE)
            ]
        );
        queueField.instanceId = IdService.generateDateBasedId(queueField.property);
        return queueField;
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

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case MailAccountProperty.QUEUE_ID:
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


    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions: KIXObjectSpecificCreateOptions,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        parameter = await super.postPrepareValues(parameter, createOptions, formContext, formInstance);

        let index = -1;
        const passwordParameter = parameter.find((p, i) => {
            if (p[0] === MailAccountProperty.PASSWORD) {
                index = i;
                return true;
            }

            return false;
        });

        if (passwordParameter && passwordParameter[1] === 'not modified' && index !== -1) {
            parameter.splice(index, 1);
        }

        return parameter;
    }

}
