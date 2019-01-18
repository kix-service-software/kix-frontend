import { IFormFieldValidator, FormField, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "..";

export class RequiredFormFieldValidator implements IFormFieldValidator {

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.required;
    }

    public async  validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        if (value && value.value && value.value !== '') {
            return new ValidationResult(ValidationSeverity.OK, '');
        } else {
            return new ValidationResult(ValidationSeverity.ERROR, `Pflichtfeld ${formField.label} hat keinen Wert.`);
        }
    }

}
