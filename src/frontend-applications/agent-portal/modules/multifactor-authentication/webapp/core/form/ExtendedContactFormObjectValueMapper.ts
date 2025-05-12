/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Contact } from '../../../../customer/model/Contact';
import { UserPreferencesFormValue } from '../../../../customer/webapp/core/form/form-values/UserPreferencesFormValue';
import { ObjectFormValueMapperExtension } from '../../../../object-forms/model/ObjectFormValueMapperExtension';
import { UserProperty } from '../../../../user/model/UserProperty';
import { MFAConfig } from '../../../model/MFAConfig';
import { MFAService } from '../MFAService';
import { MFAPreferencesFormValue } from './MFAPreferencesFormValue';

export class ExtendedContactFormObjectValueMapper extends ObjectFormValueMapperExtension {

    public async mapObjectValues(object: KIXObject): Promise<void> {
        if (object instanceof Contact && object.User) {
            const preferencesFormValue = this.objectValueMapper.findFormValue<UserPreferencesFormValue>(
                UserProperty.PREFERENCES
            );

            await this.addMFAFields(preferencesFormValue);
        }
    }

    private async addMFAFields(preferencesFormValue: UserPreferencesFormValue): Promise<void> {
        let mfaConfigs = await MFAService.getInstance().loadMFAConfigs();
        mfaConfigs = mfaConfigs.filter((mfaConfig: MFAConfig) => mfaConfig.enabled);

        if (mfaConfigs.length > 0) {
            const mfaFormValue = new MFAPreferencesFormValue(
                preferencesFormValue, this.objectValueMapper, mfaConfigs
            );
            mfaFormValue.isControlledByParent = true;
            preferencesFormValue.formValues.push(mfaFormValue);
        }
    }
}