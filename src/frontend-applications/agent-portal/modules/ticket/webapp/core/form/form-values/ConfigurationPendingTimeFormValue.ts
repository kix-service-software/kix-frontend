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