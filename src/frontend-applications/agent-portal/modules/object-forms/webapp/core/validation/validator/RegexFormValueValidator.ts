/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../base-components/webapp/core/ValidationSeverity';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';
import { ObjectFormValueValidator } from '../ObjectFormValueValidator';

export class RegexFormValueValidator extends ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result = [];

        let selectedValues = formValue.value || [];
        if (selectedValues && !Array.isArray(selectedValues)) {
            selectedValues = [selectedValues];
        }

        if (selectedValues?.length && formValue?.regExList?.length) {
            for (const value of selectedValues) {
                formValue.regExList.forEach((regExItem) => {
                    const regex = new RegExp(regExItem.regEx);
                    if (!regex.test(value)) {
                        result.push(new ValidationResult(ValidationSeverity.ERROR, regExItem.errorMessage));
                    }
                });
            }
        }

        return result;
    }

}
