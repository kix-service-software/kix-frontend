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

export class RequiredFormValueValidator extends ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result = [];

        if (formValue.required) {
            const hasValue = typeof formValue.value !== 'undefined' && formValue.value !== null && formValue.value !==
                '';
            const isArrayValueWithoutContent = (Array.isArray(formValue.value) && !formValue.value.length);

            if (!hasValue || isArrayValueWithoutContent) {
                result.push(
                    await ObjectFormValueValidator.createValidationError(
                        'Translatable#Required field {0} has no value.', formValue.label
                    )
                );
            }
        }

        return result;
    }

}
