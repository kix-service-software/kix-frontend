/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MailFilterProperty } from '../../model/MailFilterProperty';
import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { MailFilterMatch } from '../../model/MailFilterMatch';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class MailFilterMatchValidator implements IFormFieldValidator {

    public validatorId: string = 'MailFilterMatchValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === MailFilterProperty.MATCH;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {

        if (formField.property === MailFilterProperty.MATCH) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            const value = formInstance.getFormFieldValue<MailFilterMatch[]>(formField.instanceId);
            if (value && value.value && Array.isArray(value.value)) {
                for (const matchValue of value.value) {
                    if (matchValue.Value) {
                        try {
                            new RegExp(matchValue.Value);
                        } catch (error) {
                            return new ValidationResult(ValidationSeverity.ERROR, error.message);
                        }
                    } else {
                        const message = await TranslationService.translate(
                            'Translatable#{0}: has no value.',
                            [matchValue.Key]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, message);
                    }
                }
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
