/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ExtendedKIXObjectFormService } from '../../../base-components/webapp/core/ExtendedKIXObjectFormService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { UserProperty } from '../../../user/model/UserProperty';
import { MFAConfig } from '../../model/MFAConfig';
import { MFAService } from './MFAService';
import { AgentService } from '../../../user/webapp/core/AgentService';

export class MFAPersonalSettingsFormService extends ExtendedKIXObjectFormService {

    public async postPrepareForm(
        form: FormConfiguration, formInstance: FormInstance,
        formFieldValues: Map<string, FormFieldValue<any>>, kixObject: KIXObject
    ): Promise<void> {

        let mfaConfigs = await MFAService.getInstance().loadMFAConfigs().catch((): MFAConfig[] => []);
        mfaConfigs = mfaConfigs.filter((mfaConfig: MFAConfig) => mfaConfig.enabled);

        const user = await AgentService.getInstance().getCurrentUser();

        for (const mfaConfig of mfaConfigs) {

            const secretPreference = MFAService.getInstance().getMFAPreference(mfaConfig, false);
            const mfaSecretPreference = user.Preferences.find((p) => p.ID === secretPreference);

            if (mfaSecretPreference?.Value === '1') {
                const mfaGroup = new FormGroupConfiguration(
                    'personal-settings-mfa-container', 'Translatable#Multifactor Authentication'
                );
                mfaGroup.formFields = [];
                const mfaSubGroupField = new FormFieldConfiguration(
                    'personal-settings-mfa-config-container', mfaConfig.name, mfaConfig.name, null
                );

                const secretField = await this.createSecretField(mfaConfig);

                mfaSubGroupField.required = false;
                mfaSubGroupField.empty = true;
                mfaSubGroupField.asStructure = true;
                mfaSubGroupField.children = [secretField];
                mfaGroup.formFields.push(mfaSubGroupField);

                form?.pages[0]?.groups.push(mfaGroup);
            }
        }
    }

    private async createSecretField(mfaConfig: MFAConfig): Promise<FormFieldConfiguration> {
        const property = MFAService.getInstance().getMFAPreference(mfaConfig, true);
        const secretPreference = MFAService.getInstance().getMFAPreference(mfaConfig, false);

        const secretField = new FormFieldConfiguration(
            'personal-settings-mfa-secret', 'Translatable#User Secret', property,
            'user-secret-input', false, 'Translatable#Helptext_User_UserCreateEdit_Preferences_UserSecret',
            [
                new FormFieldOption('SecretProperty', secretPreference)
            ]
        );
        secretField.instanceId = IdService.generateDateBasedId();
        return secretField;
    }

}
