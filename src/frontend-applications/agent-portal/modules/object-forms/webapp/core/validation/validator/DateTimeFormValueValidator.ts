/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { DateTimeFormValue } from '../../../../model/FormValues/DateTimeFormValue';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormValueValidator } from '../ObjectFormValueValidator';

export class DateTimeFormValueValidator extends ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];

        if (formValue instanceof DateTimeFormValue) {
            const value = formValue.value;
            const hasValue = typeof value !== 'undefined' && value !== null && value !== '';

            if (hasValue) {

                let dateValues = [];
                if (Array.isArray(value)) {
                    dateValues = value
                        .filter((v) => v !== null && typeof v !== 'undefined')
                        .map((v: string) => new Date(v));
                } else {
                    dateValues.push(new Date(value));
                }

                for (const dateValue of dateValues) {

                    if (isNaN(dateValue.getTime())) {
                        const validationError = await ObjectFormValueValidator.createValidationError(
                            'Translatable#Entered date-time value is invalid.', formValue.label
                        );
                        result.push(validationError);
                    } else if (dateValue.getFullYear() > 2201) {
                        const validationError = await ObjectFormValueValidator.createValidationError(
                            'Translatable#A year after 2200 is not possible.', formValue.label
                        );
                        result.push(validationError);
                    } else {

                        const invalidMinDate = formValue.minDate && dateValue < new Date(formValue.minDate);
                        const invalidMaxDate = formValue.maxDate && dateValue > new Date(formValue.maxDate);
                        if (invalidMinDate || invalidMaxDate) {
                            const validationError = await ObjectFormValueValidator.createValidationError(
                                'Translatable#The entered date is out of boundaries.', formValue.label
                            );
                            result.push(validationError);
                        }
                    }
                }
            }
        }

        return result;
    }

}
