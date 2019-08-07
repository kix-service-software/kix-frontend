/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator, FormField, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "..";
import { TranslationService } from "../../i18n/TranslationService";

export class RequiredFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'ReguiredValidator';

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.required;
    }

    public async  validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        let ok = false;
        if (value && typeof value.value !== 'undefined' && value.value !== null && value.value !== '') {
            if (Array.isArray(value.value)) {
                ok = !!value.value.length;
            } else {
                ok = true;
            }
        }
        if (ok) {
            return new ValidationResult(ValidationSeverity.OK, '');
        } else {
            const fieldLabel = await TranslationService.translate(formField.label);
            const errorString = await TranslationService.translate(
                "Translatable#Required field '{0}' has no value.", [fieldLabel]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }
    }

}
