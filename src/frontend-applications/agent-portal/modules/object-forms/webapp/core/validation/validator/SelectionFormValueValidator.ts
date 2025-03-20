/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../model/FormValues/SelectObjectFormValue';
import { ObjectFormValueValidator } from '../ObjectFormValueValidator';

export class SelectionFormValueValidator extends ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];

        if (formValue instanceof SelectObjectFormValue) {
            const length = Array.isArray(formValue?.value)
                ? formValue.value.length
                : formValue?.value ? 1 : 0;

            if (formValue.minSelectCount > 0 && length < formValue.minSelectCount) {
                const errorString = await TranslationService.translate(
                    'Translatable#At least {0} values must be selected', [formValue.minSelectCount]
                );
                result.push(new ValidationResult(ValidationSeverity.ERROR, errorString));
            }

            if (formValue.maxSelectCount > 0 && length > formValue.maxSelectCount) {
                const errorString = await TranslationService.translate(
                    'Translatable#A maximum of {0} values can be selected.', [formValue.maxSelectCount]
                );
                result.push(new ValidationResult(ValidationSeverity.ERROR, errorString));
            }

            if ((formValue.maxSelectCount === 0 || formValue.maxSelectCount === 1) && length > 1) {
                const errorString = await TranslationService.translate(
                    'Translatable#A maximum of 1 value can be selected. (SingleSelect)'
                );
                result.push(new ValidationResult(ValidationSeverity.ERROR, errorString));
            }
        }

        return result;
    }

}