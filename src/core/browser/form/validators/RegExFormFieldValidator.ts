import { IFormFieldValidator, FormField, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "../FormService";

export class RegExFormFieldValidator implements IFormFieldValidator {

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.regEx !== null
            && typeof formField.regEx !== 'undefined'
            && typeof formField.regEx === 'string';
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && typeof fieldValue === 'string' && fieldValue !== '') {
            const regEx = new RegExp(formField.regEx);
            if (!regEx.test(fieldValue)) {
                return new ValidationResult(
                    ValidationSeverity.ERROR,
                    `Feld ${formField.label} hat ungültigen Wert (${formField.regExErrorMessage}).`
                );
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
