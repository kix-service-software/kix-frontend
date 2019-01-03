import { IFormFieldValidator, ValidationResult, FormField } from "../../model";

export class FormValidationService {

    private static INSTANCE: FormValidationService;

    public static getInstance(): FormValidationService {
        if (!FormValidationService.INSTANCE) {
            FormValidationService.INSTANCE = new FormValidationService();
        }
        return FormValidationService.INSTANCE;
    }

    private constructor() { }

    private formFieldValidators: IFormFieldValidator[] = [];

    public registerValidator(validator: IFormFieldValidator): void {
        this.formFieldValidators.push(validator);
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult[]> {
        const result = [];
        if (!formField.empty) {
            const validators = this.formFieldValidators.filter((ffv) => ffv.isValidatorFor(formField, formId));
            for (const v of validators) {
                const validationResult = await v.validate(formField, formId);
                result.push(validationResult);
            }
        }
        return result;
    }

}
