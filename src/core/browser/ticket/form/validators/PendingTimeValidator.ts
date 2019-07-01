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
