import { IFormFieldValidator, ValidationResult, FormField } from "../../model";

export class FormValidationService {

    private static INSTANCE: FormValidationService;

    // tslint:disable-next-line:max-line-length
    public static EMAIL_REGEX = '^(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';

    public static EMAIL_REGEX_ERROR_MESSAGE = 'Translatable#Inserted e-mail address is invalid.';

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
        if (formField && !formField.empty) {
            const validators = this.formFieldValidators.filter((ffv) => ffv.isValidatorFor(formField, formId));
            for (const v of validators) {
                const validationResult = await v.validate(formField, formId);
                result.push(validationResult);
            }
        }
        return result;
    }

}
