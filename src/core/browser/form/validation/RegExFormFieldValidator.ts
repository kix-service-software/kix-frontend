import { IFormFieldValidator, FormField, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "../FormService";
import { TranslationService } from "../../i18n/TranslationService";

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
            const regex = new RegExp(formField.regEx);
            if (!regex.test(fieldValue)) {
                const fieldLabel = await TranslationService.translate(formField.label);
                const errorMessage = await TranslationService.translate(formField.regExErrorMessage);
                const errorString = await TranslationService.translate(
                    "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }
}
