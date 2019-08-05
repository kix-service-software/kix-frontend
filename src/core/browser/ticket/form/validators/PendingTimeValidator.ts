/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IFormFieldValidator, FormField, ValidationResult, TicketProperty, ValidationSeverity
} from "../../../../model";
import { FormService } from "../../..";

export class PendingTimeValidator implements IFormFieldValidator {

    public validatorId: string = 'PendingTimeValidator';

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.property === TicketProperty.PENDING_TIME;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
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

}
