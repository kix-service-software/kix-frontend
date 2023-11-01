/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from './ValidationResult';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { FormInstance } from './FormInstance';

export interface IFormFieldValidator {

    validatorId: string;

    isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean;

    validate(
        formField: FormFieldConfiguration, formId: string, formInstance?: FormInstance
    ): Promise<ValidationResult | ValidationResult[]>;

    isValidatorForDF(dynamicField: DynamicField): boolean;

    validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult>;

}
