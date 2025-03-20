/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { FormInstance } from './FormInstance';

export class RequiredFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'ReguiredValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.required;
    }

    public async validate(
        formField: FormFieldConfiguration, formId: string, formInstance?: FormInstance
    ): Promise<ValidationResult> {
        if (!formInstance) {
            const context = ContextService.getInstance().getActiveContext();
            formInstance = await context?.getFormManager()?.getFormInstance();
        }
        const value = formInstance?.getFormFieldValue(formField.instanceId);
        let ok = false;
        if (value && typeof value.value !== 'undefined' && value.value !== null && value.value !== '') {
            if (Array.isArray(value.value)) {
                ok = !!value.value.length;
            } else {
                ok = true;
            }
        }
        if (ok) {
            return new ValidationResult(ValidationSeverity.OK, '');
        } else {
            const fieldLabel = await TranslationService.translate(formField.label);
            const errorString = await TranslationService.translate(
                'Translatable#Required field {0} has no value.', [fieldLabel]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

}
