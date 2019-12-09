/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from "./IFormFieldValidator";
import { FormService } from "./FormService";
import { ValidationResult } from "./ValidationResult";
import { ValidationSeverity } from "./ValidationSeverity";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { TranslationService } from "../../../translation/webapp/core";

export class RegExFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'RegExValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.regEx !== null
            && typeof formField.regEx !== 'undefined'
            && typeof formField.regEx === 'string';
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
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
