import {
    IFormFieldValidator, FormField, ValidationResult, TicketProperty, ValidationSeverity
} from "../../../../model";
import { FormService } from "../../..";
import { PendingTimeFormValue } from "..";

export class PendingTimeValidator implements IFormFieldValidator {

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.property === TicketProperty.STATE_ID;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const formFieldValue = formInstance.getFormFieldValue<PendingTimeFormValue>(formField.instanceId);

        let result = new ValidationResult(ValidationSeverity.OK, '');
        if (formFieldValue && formFieldValue.value) {
            const stateValue = formFieldValue.value;
            if (stateValue.pending) {
                if (this.hasValidDate(stateValue)) {
                    const now = new Date();
                    if (now > stateValue.pendingDate) {
                        result = new ValidationResult(
                            ValidationSeverity.ERROR, 'Translatable#Pending date is not in the future.'
                        );
                    }
                } else {
                    result = new ValidationResult(
                        ValidationSeverity.ERROR,
                        'Translatable#Invalid date.'
                    );
                }
            }
        }

        return result;
    }

    private hasValidDate(stateValue: PendingTimeFormValue): boolean {
        return stateValue.pendingDate && !isNaN(stateValue.pendingDate.getTime());
    }

}
