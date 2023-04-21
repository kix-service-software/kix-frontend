/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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

        if (formValue?.value && formValue?.regExList?.length) {
            formValue.regExList.forEach((regExItem) => {
                const regex = new RegExp(regExItem.regEx);
                if (!regex.test(formValue.value)) {
                    result.push(new ValidationResult(ValidationSeverity.ERROR, regExItem.errorMessage));
                }
            });
        }

        return result;
    }

}
