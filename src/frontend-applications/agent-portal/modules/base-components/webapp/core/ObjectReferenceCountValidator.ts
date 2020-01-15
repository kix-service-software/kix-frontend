/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { TranslationService } from '../../../translation/webapp/core';
import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { FormService } from '../../../base-components/webapp/core/FormService';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { ObjectReferenceOptions } from './ObjectReferenceOptions';

export class ObjectReferenceCountValidator implements IFormFieldValidator {

    public validatorId: string = 'ObjectReferenceCountValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        const isInputComponent = formField.inputComponent === 'object-reference-input';
        const hasCountMin = formField.options ?
            formField.options.some((o) => o.option === ObjectReferenceOptions.COUNT_MIN)
            : false;
        const hasCountMax = formField.options ?
            formField.options.some((o) => o.option === ObjectReferenceOptions.COUNT_MAX)
            : false;

        return isInputComponent && (hasCountMin || hasCountMax);
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && Array.isArray(fieldValue)) {
            const countMin = formField.options.find((o) => o.option === ObjectReferenceOptions.COUNT_MIN);
            const countMax = formField.options.find((o) => o.option === ObjectReferenceOptions.COUNT_MAX);

            if (countMin && countMin.value > 0 && fieldValue.length < countMin.value) {
                const fieldLabel = await TranslationService.translate(formField.label);
                const errorMessage = await TranslationService.translate(
                    'Translatable#At least {0} values must be selected', [countMin.value]
                );
                const errorString = await TranslationService.translate(
                    "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

            if (countMax && countMax.value > 1 && fieldValue.length > countMax.value) {
                const fieldLabel = await TranslationService.translate(formField.label);
                const errorMessage = await TranslationService.translate(
                    'Translatable#A maximum of {0} values can be selected.', [countMax.value]
                );
                const errorString = await TranslationService.translate(
                    "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

            if ((!countMax || countMax.value === 0 || countMax.value === 1) && fieldValue.length > 1) {
                const fieldLabel = await TranslationService.translate(formField.label);
                const errorMessage = await TranslationService.translate(
                    'Translatable#A maximum of 1 value can be selected. (SingleSelect)', [countMax.value]
                );
                const errorString = await TranslationService.translate(
                    "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
