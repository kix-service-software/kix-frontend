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
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { NumberInputOptions } from '../../../base-components/webapp/core/NumberInputOptions';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';

export class DashboardIntervallValidator implements IFormFieldValidator {

    public validatorId: string = 'DashboardIntervallValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        const option = formField.options.find((o) => o.option === NumberInputOptions.POSITIVE_INTEGER);
        const hasIntergerOption = BrowserUtil.isBooleanTrue(option?.value);
        return formField.inputComponent === 'number-input' && hasIntergerOption;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = Number(formInstance.getFormFieldValue<number>(formField.instanceId)?.value);
        if (value < 0 || !Number.isInteger(value)) {
            const fieldLabel = await TranslationService.translate(formField.label);
            const errorString = await TranslationService.translate(
                'Translatable#Field {0} has to be a positive integer number.', [fieldLabel]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
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
