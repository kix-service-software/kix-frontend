/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { ObjectReferenceOptions } from './ObjectReferenceOptions';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { ContextService } from './ContextService';

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
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && Array.isArray(fieldValue)) {
            const countMin = formField.options.find((o) => o.option === ObjectReferenceOptions.COUNT_MIN);
            const countMax = formField.options.find((o) => o.option === ObjectReferenceOptions.COUNT_MAX);

            return await this.checkCountValues(fieldValue?.length, countMin?.value, countMax?.value, formField?.label);
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return dynamicField && dynamicField.Config && (dynamicField.Config.CountMax || dynamicField.Config.CountMin);
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        if (value && Array.isArray(value)) {
            const countMin = Number(dynamicField.Config.CountMin);
            const countMax = Number(dynamicField.Config.CountMax);
            return await this.checkCountValues(value.length, countMin, countMax, dynamicField.Label);
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async checkCountValues(
        valueCount: number, countMin: number, countMax: number, label: string
    ): Promise<ValidationResult> {
        if (countMin && countMin > 0 && valueCount < countMin) {
            const fieldLabel = await TranslationService.translate(label);
            const errorMessage = await TranslationService.translate(
                'Translatable#At least {0} values must be selected', [countMin]
            );
            const errorString = await TranslationService.translate(
                'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }

        if (countMax && countMax > 1 && valueCount > countMax) {
            const fieldLabel = await TranslationService.translate(label);
            const errorMessage = await TranslationService.translate(
                'Translatable#A maximum of {0} values can be selected.', [countMax]
            );
            const errorString = await TranslationService.translate(
                'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }

        if ((!countMax || countMax === 0 || countMax === 1) && valueCount > 1) {
            const fieldLabel = await TranslationService.translate(label);
            const errorMessage = await TranslationService.translate(
                'Translatable#A maximum of 1 value can be selected. (SingleSelect)', [countMax]
            );
            const errorString = await TranslationService.translate(
                'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
