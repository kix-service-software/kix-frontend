/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IFormFieldValidator, ValidationResult, ValidationSeverity, FormFieldOptions
} from "../../../model";
import { FormService } from "../FormService";
import { TranslationService } from "../../i18n/TranslationService";
import { FormFieldConfiguration } from "../../../model/components/form/configuration";

export class JSONFormFieldValidator implements IFormFieldValidator {

    public validatorId: string = 'JSONValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        if (formField.options) {
            const option = formField.options.find((o) => o.option === FormFieldOptions.IS_JSON);
            if (option) {
                return option.value;
            }
        }
        return false;
    }

    public async  validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const formFieldValue = formInstance.getFormFieldValue<string>(formField.instanceId);

        if (formFieldValue.value === null || this.IsValidJSONString(formFieldValue.value)) {
            return new ValidationResult(ValidationSeverity.OK, '');
        } else {
            const fieldLabel = await TranslationService.translate(formField.label);
            const errorString = await TranslationService.translate(
                "Translatable#Required field '{0}' is no JSON.", [fieldLabel]
            );
            return new ValidationResult(ValidationSeverity.ERROR, errorString);
        }
    }
    private IsValidJSONString(json: string): boolean {
        try {
            JSON.parse(json);
        } catch (e) {
            if (json.indexOf('{') !== -1 || json.indexOf('[') !== -1) {
                return false;
            }
        }
        return true;
    }
}
