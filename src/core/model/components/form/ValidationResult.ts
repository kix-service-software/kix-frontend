import { ValidationSeverity } from ".";

export class ValidationResult {

    public constructor(
        public severity: ValidationSeverity,
        public message: string
    ) { }

}
