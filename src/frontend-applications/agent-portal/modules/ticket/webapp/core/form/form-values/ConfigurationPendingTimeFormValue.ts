/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { PendingTimeFormValue } from './PendingTimeFormValue';

export class ConfigurationPendingTimeFormValue extends PendingTimeFormValue {

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        if (this.isRelativeTimeValue) {
            this.inputComponentId = 'relative-datetime-config-input';
        } else {
            this.inputComponentId = 'datetime-form-input';
        }
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        this.value = value;
    }

}