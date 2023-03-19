/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldFormUtil } from '../../../../../../base-components/webapp/core/DynamicFieldFormUtil';
import { ValidationResult } from '../../../../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { DynamicFieldChecklistFormValue } from '../../../../../model/FormValues/DynamicFields/DynamicFieldChecklistFormValue';
import { DynamicFieldTableFormValue } from '../../../../../model/FormValues/DynamicFields/DynamicFieldTableFormValue';
import { ObjectFormValueValidator } from '../../ObjectFormValueValidator';

export class DynamicFieldChecklistValidator extends ObjectFormValueValidator {

    public async validate(formValue: DynamicFieldTableFormValue): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];

        if (formValue.required && formValue instanceof DynamicFieldChecklistFormValue) {
            const validationResult = await this.checkValues(formValue.value, formValue.label);
            result.push(validationResult);
        }

        return result;
    }

    private async checkValues(value: any, label: string): Promise<ValidationResult> {

        if (Array.isArray(value)) {
            const values = DynamicFieldFormUtil.getInstance().countValues(value);

            if (values[0] === 0 && values[1] > 0) {
                return await this.createError(label);
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async createError(label: string): Promise<ValidationResult> {
        const fieldLabel = await TranslationService.translate(label);
        const errorString = await TranslationService.translate(
            'Translatable#Required field {0} has no value.', [fieldLabel]
        );
        return new ValidationResult(ValidationSeverity.ERROR, errorString);
    }
}
