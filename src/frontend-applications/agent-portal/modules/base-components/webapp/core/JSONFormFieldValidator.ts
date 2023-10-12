/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { ContextService } from './ContextService';

export class JSONFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'JSONValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId?: string): boolean {
        if (formField.options) {
            const option = formField.options.find((o) => o.option === FormFieldOptions.IS_JSON);
            if (option) {
                return option.value;
            }
        }
        return false;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const formFieldValue = formInstance?.getFormFieldValue<string>(formField?.instanceId);

        if (formFieldValue?.value === null || this.IsValidJSONString(formFieldValue?.value)) {
            return new ValidationResult(ValidationSeverity.OK, '');
        } else {
            const fieldLabel = await TranslationService.translate(formField?.label);
            const errorString = await TranslationService.translate(
                'Translatable#Required field {0} is no JSON.', [fieldLabel]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }
    }
    private IsValidJSONString(json: string): boolean {
        try {
            JSON.parse(json);
        } catch (e) {
            if (json.match(/^\s*?(\{|\[)/) || json.match(/(\}|\])\s*$/)) {
                return false;
            }
        }
        return true;
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
