/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../../../../modules/base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { TicketProperty } from '../../../../model/TicketProperty';
import { ValidationResult } from '../../../../../../modules/base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { DynamicField } from '../../../../../dynamic-fields/model/DynamicField';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';

export class PendingTimeValidator implements IFormFieldValidator {

    public validatorId: string = 'PendingTimeValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === TicketProperty.PENDING_TIME;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const formFieldValue = formInstance.getFormFieldValue<Date>(formField.instanceId);

        let result = new ValidationResult(ValidationSeverity.OK, '');
        if (formFieldValue && formFieldValue.value) {
            const pendingDate = formFieldValue.value;
            if (this.hasValidDate(pendingDate)) {
                const now = new Date();
                if (now > pendingDate) {
                    result = new ValidationResult(
                        ValidationSeverity.ERROR, 'Translatable#Pending date is not in the future.'
                    );
                }
            } else {
                result = new ValidationResult(
                    ValidationSeverity.ERROR,
                    'Translatable#Invalid date for pending date.'
                );
            }
        }

        return result;
    }

    private hasValidDate(date: Date): boolean {
        return date && !isNaN(date.getTime());
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

}
