/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Contact } from '../../../../customer/model/Contact';
import { UserPreferencesFormValue } from '../../../../customer/webapp/core/form/form-values/UserPreferencesFormValue';
import { FormValueProperty } from '../../../../object-forms/model/FormValueProperty';
import { BooleanFormValue } from '../../../../object-forms/model/FormValues/BooleanFormValue';
import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { UserPreference } from '../../../../user/model/UserPreference';
import { MFAConfig } from '../../../model/MFAConfig';
import { MFAService } from '../MFAService';

export class MFAPreferencesFormValue extends ObjectFormValue {

    public constructor(
        public preferencesFormValue: UserPreferencesFormValue,
        objectValueMapper: ObjectFormValueMapper,
        mfaConfigs: MFAConfig[]
    ) {
        super(null, null, objectValueMapper, null);

        this.inputComponentId = null;
        this.label = 'Translatable#Multifactor Authentication';
        this.visible = true;
        this.setNewInitialState(FormValueProperty.VISIBLE, true);

        const preferences = preferencesFormValue.user?.Preferences || [];

        for (const mfaConfig of mfaConfigs) {

            const enablePreferenceName = MFAService.getInstance().getMFAPreference(mfaConfig, false);
            let enablePreference = preferences.find((p) => p.ID === enablePreferenceName);
            if (!enablePreference) {
                enablePreference = new UserPreference();
                enablePreference.ID = enablePreferenceName;
                enablePreference.Value = '0';
                preferencesFormValue.user?.Preferences?.push(enablePreference);
            }

            const mfaConfigFormValue = new ObjectFormValue(null, null, objectValueMapper, this);
            mfaConfigFormValue.inputComponentId = null;
            mfaConfigFormValue.label = mfaConfig.name;
            this.formValues.push(mfaConfigFormValue);

            const enableFormValue = new BooleanFormValue(
                'Value', enablePreference, objectValueMapper, mfaConfigFormValue
            );
            enableFormValue.label = 'Translatable#Enabled';
            mfaConfigFormValue.formValues.push(enableFormValue);

            if ((this.objectValueMapper.object as Contact)?.User?.UserID) {
                const secretPreferenceName = MFAService.getInstance().getMFAPreference(mfaConfig, true);
                let secretPreference = preferences.find((p) => p.ID === secretPreferenceName);
                if (!secretPreference) {
                    secretPreference = new UserPreference();
                    secretPreference.ID = secretPreferenceName;
                    secretPreference.Value = null;
                    preferencesFormValue.user?.Preferences?.push(secretPreference);
                }
                const userSecretFormValue = new ObjectFormValue(
                    'Value', secretPreference, objectValueMapper, mfaConfigFormValue
                );
                userSecretFormValue.label = 'Translatable#User Secret';
                userSecretFormValue.inputComponentId = 'user-secret-input';
                userSecretFormValue['secretPreference'] = MFAService.getInstance().getMFAPreference(mfaConfig, false);
                mfaConfigFormValue.formValues.push(userSecretFormValue);
            }

            mfaConfigFormValue.formValues.forEach((fv) => fv.visible = true);
        }

        this.formValues.forEach((fv) => {
            fv.visible = true;
            fv.setNewInitialState(FormValueProperty.VISIBLE, true);
        });
    }

    public async enable(): Promise<void> {
        await super.enable();
        for (const fv of this.formValues) {
            await fv.enable();

            if (fv.formValues?.length) {
                for (const subFv of fv.formValues) {
                    await subFv.enable();
                }
            }
        }
    }

}