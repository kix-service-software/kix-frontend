/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from './DynamicFormFieldOption';
import { DynamicField } from '../../model/DynamicField';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { DynamicFieldTypes } from '../../model/DynamicFieldTypes';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';

export class DynamicFieldTableValidator implements IFormFieldValidator {

    public validatorId: string = 'DynamicFieldTableValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === KIXObjectProperty.DYNAMIC_FIELDS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const nameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);

        if (nameOption) {
            const dynamicField = await KIXObjectService.loadDynamicField(nameOption.value);
            if (this.isValidatorForDF(dynamicField)) {
                return await this.checkValues(value, formField.label);
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }


    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return dynamicField && dynamicField.Config && dynamicField.FieldType === DynamicFieldTypes.TABLE;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return await this.checkValues(value, dynamicField.Label);
    }

    private async checkValues(value: any, label: string): Promise<ValidationResult> {
        const tableValue = await this.preparedValue(value);

        if (tableValue) {
            if (!Array.isArray(tableValue)) {
                return this.createError(null, label);
            }

            for (let i = 0; i < tableValue.length; i++) {
                const emptyCount = tableValue[i].filter((c) => c === '').length;
                const colCount = tableValue[i].length;

                if (emptyCount === colCount) {
                    return this.createError((i + 1), label);
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async preparedValue(value: any): Promise<Array<string[]>> {
        let result: Array<string[]> = null;
        if (value) {
            const tableValue = value.value;
            if (typeof tableValue === 'string' && tableValue !== '') {
                result = JSON.parse(tableValue);
            } else if (Array.isArray(tableValue) && tableValue[0] !== '') {
                result = JSON.parse(tableValue[0]);
            }
        }

        return result;
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
