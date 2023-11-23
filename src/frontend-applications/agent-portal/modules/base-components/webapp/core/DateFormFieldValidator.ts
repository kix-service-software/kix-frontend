/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from './IFormFieldValidator';
import { ValidationResult } from './ValidationResult';
import { ValidationSeverity } from './ValidationSeverity';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { FormInstance } from './FormInstance';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';

export class DateFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'DateFormFieldValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.inputComponent === 'date-time-input';
    }

    public async validate(
        formField: FormFieldConfiguration, formId: string, formInstance?: FormInstance
    ): Promise<ValidationResult> {

        const value = formInstance.getFormFieldValue(formField.instanceId);

        if (value?.value instanceof Date) {
            const minDateOption = formField.options?.find((o) => o.option === FormFieldOptions.MIN_DATE);
            if (minDateOption) {
                const minDate = new Date(minDateOption.value);
                if (minDate > value?.value) {
                    const errorString = await TranslationService.translate(
                        'Translatable#Field {0} has an invalid value (min date: {2}).',
                        [formField.label, minDateOption.value]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }
            }

            const maxDateOption = formField.options?.find((o) => o.option === FormFieldOptions.MAX_DATE);
            if (maxDateOption) {
                const maxDate = new Date(maxDateOption.value);
                if (maxDate < value?.value) {
                    const errorString = await TranslationService.translate(
                        'Translatable#Field {0} has an invalid value (max date: {1}).',
                        [formField.label, maxDateOption.value]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

}
