/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequiredFormFieldValidator } from './RequiredFormFieldValidator';
import { RegExFormFieldValidator } from './RegExFormFieldValidator';
import { MaxLengthFormFieldValidator } from './MaxLengthFormFieldValidator';
import { JSONFormFieldValidator } from './JSONFormFieldValidator';
import { IFormFieldValidator } from './IFormFieldValidator';
import { ValidationResult } from './ValidationResult';
import addrparser from 'address-rfc2822';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { FormInstance } from './FormInstance';

export class FormValidationService {

    private static INSTANCE: FormValidationService;

    // tslint:disable-next-line:max-line-length
    public static EMAIL_REGEX = '^(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';

    public static EMAIL_REGEX_ERROR_MESSAGE = 'Translatable#Inserted email address is invalid';

    public static getInstance(): FormValidationService {
        if (!FormValidationService.INSTANCE) {
            FormValidationService.INSTANCE = new FormValidationService();
        }
        return FormValidationService.INSTANCE;
    }
    private constructor() {
        this.initDefaultValidators();
    }

    private initDefaultValidators(): void {
        this.registerValidator(new RequiredFormFieldValidator());
        this.registerValidator(new MaxLengthFormFieldValidator());
        this.registerValidator(new RegExFormFieldValidator());
        this.registerValidator(new JSONFormFieldValidator());
    }

    private formFieldValidators: IFormFieldValidator[] = [];

    public registerValidator(validator: IFormFieldValidator): void {
        if (!this.formFieldValidators.some((v) => v.validatorId === validator.validatorId)) {
            this.formFieldValidators.push(validator);
        }
    }

    public async validate(
        formField: FormFieldConfiguration, formId: string, formInstance?: FormInstance
    ): Promise<ValidationResult[]> {
        const result = [];
        if (formField && !formField.empty) {
            const validators = this.formFieldValidators.filter((ffv) => ffv.isValidatorFor(formField, formId));
            for (const v of validators) {
                const validationResult = await v.validate(formField, formId, formInstance);
                result.push(validationResult);
            }
        }
        return result;
    }

    public async validateDynamicFieldValue(dynamicField: DynamicField, value: any): Promise<ValidationResult[]> {
        const result = [];
        const validators = this.formFieldValidators.filter((ffv) => ffv.isValidatorForDF(dynamicField));
        for (const v of validators) {
            const validationResult = await v.validateDF(dynamicField, value);
            result.push(validationResult);
        }
        return result;
    }

    public isValidEmail(email: string): boolean {
        let isValidEmail: boolean = true;
        try {
            addrparser.parse(email.trim().toLowerCase());
        } catch {
            isValidEmail = false;
        }
        return isValidEmail;
    }

}
