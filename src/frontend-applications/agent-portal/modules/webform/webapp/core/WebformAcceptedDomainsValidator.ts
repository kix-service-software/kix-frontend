/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { WebformProperty } from '../../model/WebformProperty';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class WebformAcceptedDomainsValidator implements IFormFieldValidator {

    public validatorId: string = 'WebformAcceptedDomainsValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === WebformProperty.ACCEPTED_DOMAINS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {

        if (formField.property === WebformProperty.ACCEPTED_DOMAINS) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            const value = formInstance.getFormFieldValue<string>(formField.instanceId);
            if (value && value.value && !value.value.match(/^\*$/)) {
                try {
                    new RegExp(value.value);
                } catch (error) {
                    return new ValidationResult(ValidationSeverity.ERROR, error.message);
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
