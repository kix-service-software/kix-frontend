/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator, ValidationResult, ValidationSeverity } from "../../../model";
import { FormService } from "../FormService";
import { TranslationService } from "../../i18n/TranslationService";
import { FormFieldConfiguration } from "../../../model/components/form/configuration";

export class MaxLengthFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'MaxLengthValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.maxLength !== null && typeof formField.maxLength !== 'undefined' && formField.maxLength > 0;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
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
