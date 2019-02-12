import { IFormFieldValidator, FormField, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "../FormService";

export class MaxLengthFormFieldValidator implements IFormFieldValidator {

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.maxLength !== null && typeof formField.maxLength !== 'undefined' && formField.maxLength > 0;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && typeof fieldValue === 'string' && fieldValue !== '') {
            if (fieldValue.length > formField.maxLength) {
                return new ValidationResult(
                    ValidationSeverity.ERROR,
                    `Feld ${formField.label} hat zu langen Wert (maximal: ${formField.maxLength}).`
                );
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
