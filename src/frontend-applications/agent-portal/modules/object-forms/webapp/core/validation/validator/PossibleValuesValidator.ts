/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormValueValidator } from '../ObjectFormValueValidator';

export class PossibleValuesValidator extends ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];

        const hasValue = typeof formValue.value !== 'undefined' && formValue.value !== null && formValue.value !== '';

        if (formValue.possibleValues?.length && hasValue) {
            const values = Array.isArray(formValue.value) ? formValue.value : [formValue.value];

            if (values.length) {
                const valid = values.some((v) => formValue.possibleValues.some((pv) => pv.toString() === v.toString()));
                if (!valid) {
                    result.push(
                        await ObjectFormValueValidator.createValidationError(`Invalid value ${ formValue.value }`));
                }
            }
        }

        return result;
    }

}
