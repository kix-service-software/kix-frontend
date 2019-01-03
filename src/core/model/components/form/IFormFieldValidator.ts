import { FormField, ValidationResult } from ".";

export interface IFormFieldValidator {

    isValidatorFor(formField: FormField, formId: string): boolean;

    validate(formField: FormField, formId: string): Promise<ValidationResult>;

}
