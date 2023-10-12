/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { DynamicFieldTableFormValue } from '../../../../../model/FormValues/DynamicFields/DynamicFieldTableFormValue';
import { ObjectFormValueValidator } from '../../ObjectFormValueValidator';

export class DynamicFieldTableValidator extends ObjectFormValueValidator {

    public async validate(formValue: DynamicFieldTableFormValue): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];

        if (formValue.required && formValue instanceof DynamicFieldTableFormValue) {
            const validationResult = await this.checkValues(formValue.value, formValue.label);
            result.push(validationResult);
        }

        return result;
    }

    private async checkValues(value: any, label: string): Promise<ValidationResult> {

        if (value) {
            if (!Array.isArray(value)) {
                return this.createError(null, label);
            }

            for (let i = 0; i < value.length; i++) {
                const emptyCount = value[i].filter((c) => c === '').length;
                const colCount = value[i].length;

                if (emptyCount === colCount) {
                    return this.createError((i + 1), label);
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async createError(row: number, label: string): Promise<ValidationResult> {
        const fieldLabel = await TranslationService.translate(label);
        let errorString = '';
        if (row) {
            errorString = await TranslationService.translate(
                'Translatable#Field {0} has an empty row ({1}).', [fieldLabel, row]
            );
        }
        else {
            errorString = await TranslationService.translate(
                'Translatable#Field {0} has an empty rows.', [fieldLabel]
            );
        }
        return new ValidationResult(ValidationSeverity.ERROR, errorString);
    }
}
