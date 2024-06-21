/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ExtendedKIXObjectFormService } from '../../../base-components/webapp/core/ExtendedKIXObjectFormService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';

export class ExtendedContactFormService extends ExtendedKIXObjectFormService {

    public async addPreferencesFields(
        preferencesField: FormFieldConfiguration, formInstance?: FormInstance, formObject?: KIXObject
    ): Promise<void> {
        return;
    }

}