/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { Contact } from '../../../customer/model/Contact';
import { ExtendedContactFormService } from '../../../customer/webapp/core/ExtendedContactFormService';
import { UserProperty } from '../../../user/model/UserProperty';
import { MFAConfig } from '../../model/MFAConfig';
import { MFAService } from './MFAService';

export class MFAContactFormService extends ExtendedContactFormService {

    public async addPreferencesFields(
        preferencesField: FormFieldConfiguration, formInstance?: FormInstance
    ): Promise<void> {

        const context = ContextService.getInstance().getActiveContext();
        const contact = await context?.getObject<Contact>();

        let mfaConfigs = await MFAService.getInstance().loadMFAConfigs();
        mfaConfigs = mfaConfigs.filter((mfaConfig: MFAConfig) => mfaConfig.enabled);

        if (mfaConfigs.length > 0) {
            const mfaGroupField = new FormFieldConfiguration(
                'contact-form-field-preferences-mfa-container', 'Translatable#Multifactor Authentication', 'MFA', null
            );

            mfaGroupField.required = false;
            mfaGroupField.empty = true;
            mfaGroupField.asStructure = true;
            mfaGroupField.children = [];

            for (const mfaConfig of mfaConfigs) {
                const mfaSubGroupField = await this.createFields(mfaConfig, formInstance, contact);
                mfaGroupField.children.push(mfaSubGroupField);
            }

            preferencesField?.children.push(mfaGroupField);
        }
    }

    private async createFields(
        mfaConfig: MFAConfig, formInstance: FormInstance, contact: Contact
    ): Promise<FormFieldConfiguration> {
        const mfaSubGroupField = new FormFieldConfiguration(
            'contact-form-field-preferences-mfa-config-container', mfaConfig.name, mfaConfig.name, null
        );

        mfaSubGroupField.required = false;
        mfaSubGroupField.empty = true;
        mfaSubGroupField.asStructure = true;
        mfaSubGroupField.children = [];

        const mfaField = await this.createMFAField(formInstance, mfaConfig);
        mfaSubGroupField.children.push(mfaField);

        if (formInstance.getFormContext() === FormContext.EDIT) {
            const secretField = await this.createSecretField(formInstance, mfaConfig, contact);
            mfaSubGroupField.children.push(secretField);
        }

        return mfaSubGroupField;
    }

    private async createMFAField(formInstance: FormInstance, mfaConfig: MFAConfig): Promise<FormFieldConfiguration> {
        const property = MFAService.getInstance().getMFAPreference(mfaConfig, false);

        const mfaField = new FormFieldConfiguration(
            'contact-form-field-user-mfa-otp-enabled', 'Translatable#Enabled', property,
            'checkbox-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_MFAOTPEnabled'
        );
        mfaField.defaultValue = new FormFieldValue(false);
        mfaField.instanceId = IdService.generateDateBasedId();
        return mfaField;
    }

    private async createSecretField(
        formInstance: FormInstance, mfaConfig: MFAConfig, contact: Contact
    ): Promise<FormFieldConfiguration> {
        const property = MFAService.getInstance().getMFAPreference(mfaConfig, true);
        const secretPreference = MFAService.getInstance().getMFAPreference(mfaConfig, false);

        const secretField = new FormFieldConfiguration(
            'contact-form-field-user-mfa-secret', 'Translatable#User Secret', property,
            'user-secret-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_UserSecret',
            [
                new FormFieldOption(UserProperty.USER_ID, contact?.AssignedUserID),
                new FormFieldOption('SecretProperty', secretPreference)
            ]
        );
        secretField.instanceId = IdService.generateDateBasedId();
        return secretField;
    }

    public async postPrepareValues(
        parameter: [string, any][], createOptions?: KIXObjectSpecificCreateOptions,
        formContext?: FormContext, formInstance?: FormInstance
    ): Promise<[string, any][]> {
        const isAgentParameter = parameter.find((p) => p[0] === UserProperty.IS_AGENT);
        const isCustomerParameter = parameter.find((p) => p[0] === UserProperty.IS_CUSTOMER);

        if (isAgentParameter || isCustomerParameter) {
            let preferencesValue = parameter.find((p) => p[0] === UserProperty.PREFERENCES);
            if (!preferencesValue) {
                preferencesValue = [UserProperty.PREFERENCES, []];
                parameter.push(preferencesValue);
            }

            if (!Array.isArray(preferencesValue[1])) {
                preferencesValue[1] = [];
            }

            const preferences = preferencesValue[1];

            const mfaConfigs = await MFAService.getInstance().loadMFAConfigs();
            for (const mfaConfig of mfaConfigs) {
                const mfaProperty = MFAService.getInstance().getMFAPreference(mfaConfig, false);
                const mfaValue = await formInstance.getFormFieldValueByProperty(mfaProperty);
                preferences.push({ ID: mfaProperty, Value: mfaValue?.value });
            }
        }

        return parameter;
    }

    public async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, contact: Contact
    ): Promise<void> {
        if (form.formContext === FormContext.EDIT && contact?.User?.Preferences?.length) {
            const mfaConfigs = await MFAService.getInstance().loadMFAConfigs();
            for (const mfaConfig of mfaConfigs) {
                const mfaProperty = MFAService.getInstance().getMFAPreference(mfaConfig, false);
                const mfaPreference = contact.User.Preferences.find((p) => p.ID === mfaProperty);
                if (mfaPreference) {
                    const booleanValue = BrowserUtil.isBooleanTrue(mfaPreference.Value);
                    const formField = formInstance.getFormFieldByProperty(mfaProperty);
                    formFieldValues.set(formField?.instanceId, new FormFieldValue(booleanValue));
                }

                const secretProperty = MFAService.getInstance().getMFAPreference(mfaConfig, true);
                const mfaSecretPreference = contact.User.Preferences.find((p) => p.ID === secretProperty);
                if (mfaSecretPreference) {
                    const formField = formInstance.getFormFieldByProperty(secretProperty);
                    formFieldValues.set(formField?.instanceId, new FormFieldValue(mfaSecretPreference.Value));
                }
            }
        }
    }

}
