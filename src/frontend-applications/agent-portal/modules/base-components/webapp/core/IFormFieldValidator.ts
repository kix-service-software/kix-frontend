/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from "./ValidationResult";
import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";

export interface IFormFieldValidator {

    validatorId: string;

    isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean;

    validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult>;

}
