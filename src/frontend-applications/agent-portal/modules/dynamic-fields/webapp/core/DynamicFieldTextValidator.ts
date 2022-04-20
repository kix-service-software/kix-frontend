/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../model/DynamicFieldProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class DynamicFieldTextValidator implements IFormFieldValidator {

    public validatorId: string = 'DynamicFieldTextValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === KIXObjectProperty.DYNAMIC_FIELDS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && typeof fieldValue === 'string' && fieldValue !== '') {
            const nameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);

            if (nameOption) {
                const regexList = await this.loadRegExList(nameOption.value);
                return this.evaluateRegexList(regexList, fieldValue, formField.label);
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async loadRegExList(name: string): Promise<any[]> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.NAME, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, name
                )
            ], null, null, [DynamicFieldProperty.CONFIG]
        );
        const fields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        const dynamicField = fields && fields.length ? fields[0] : null;

        return this.getRegexList(dynamicField);
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return dynamicField && dynamicField.Config && dynamicField.Config.RegExList &&
            (dynamicField.FieldType === 'Text' || dynamicField.FieldType === 'TextArea');
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        const regexList = this.getRegexList(dynamicField);
        if (value && Array.isArray(value)) {
            for (const v of value) {
                const result = await this.evaluateRegexList(regexList, v, dynamicField.Label);
                if (result.severity === ValidationSeverity.ERROR) {
                    return result;
                }
            }
        } else {
            return this.evaluateRegexList(regexList, value, dynamicField.Label);
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private getRegexList(dynamicField: DynamicField): any[] {
        if (dynamicField && (dynamicField.FieldType === 'Text' || dynamicField.FieldType === 'TextArea')) {
            if (dynamicField.Config.RegExList && dynamicField.Config.RegExList.length) {
                return dynamicField.Config.RegExList;
            }
        }

        return [];
    }

    private async evaluateRegexList(regexList: any[], value: any, label: string): Promise<ValidationResult> {
        for (const regexEntry of regexList) {
            const regex = new RegExp(regexEntry.Value);
            if (!regex.test(value)) {
                const fieldLabel = await TranslationService.translate(label);
                const errorMessage = await TranslationService.translate(regexEntry.ErrorMessage);
                const errorString = await TranslationService.translate(
                    'Translatable#Field {0} has an invalid value ({1}).', [fieldLabel, errorMessage]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
