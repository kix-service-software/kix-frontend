/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../model/FormValues/SelectObjectFormValue';
import { ObjectFormValueValidator } from '../ObjectFormValueValidator';

export class PossibleValuesValidator extends ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];

        const hasValue = typeof formValue.value !== 'undefined' && formValue.value !== null && formValue.value !== '';

        if ((formValue.possibleValues?.length || formValue.additionalValues?.length) && hasValue) {
            const values = Array.isArray(formValue.value) ? formValue.value : [formValue.value];

            if (values.length) {

                let freeText = false;
                if (formValue instanceof SelectObjectFormValue) {
                    freeText = formValue.freeText;
                }

                const valid = freeText || values.every((v) => formValue.isValidValue(v));
                if (!valid) {
                    const error = await ObjectFormValueValidator.createValidationError(
                        `Invalid value ${formValue.value}`
                    );
                    result.push(error);
                }
            }
        }

        return result;
    }

}
