/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';

export class ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue): Promise<ValidationResult[]> {
        return [];
    }

    public static async createValidationError(err: string, label?: string): Promise<ValidationResult> {
        const fieldLabel = label ? await TranslationService.translate(label) : '';
        const errorString = await TranslationService.translate(err, [fieldLabel]);
        return new ValidationResult(ValidationSeverity.ERROR, errorString);
    }

}
