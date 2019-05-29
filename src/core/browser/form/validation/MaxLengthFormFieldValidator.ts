import { IFormFieldValidator, FormField, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "../FormService";
import { TranslationService } from "../../i18n/TranslationService";

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
                const fieldLabel = await TranslationService.translate(formField.label);
                const errorString = await TranslationService.translate(
                    "Translatable#Value of field '{0}' is too long (max: {1}).", [fieldLabel, formField.maxLength]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
