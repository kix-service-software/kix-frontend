/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ContextService } from './ContextService';

export class MaxLengthFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'MaxLengthValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.maxLength !== null && typeof formField.maxLength !== 'undefined' && formField.maxLength > 0;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && typeof fieldValue === 'string' && fieldValue !== '') {
            if (fieldValue.length > formField.maxLength) {
                const fieldLabel = await TranslationService.translate(formField.label);
                const errorString = await TranslationService.translate(
                    'Translatable#Value of field {0} is too long (max: {1}).', [fieldLabel, formField.maxLength]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
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
