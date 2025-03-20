/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../../modules/base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { PersonalSettingsProperty } from '../../model/PersonalSettingsProperty';
import { ValidationResult } from '../../../../modules/base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../modules/base-components/webapp/core/ValidationSeverity';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { DynamicField } from '../../../dynamic-fields/model/DynamicField';
import { ContextService } from '../../../base-components/webapp/core/ContextService';

export class UserPasswordValidator implements IFormFieldValidator {

    public validatorId: string = 'UserPasswordValidator';

    public readonly USER_PASSWORD_PROPERTY: string = PersonalSettingsProperty.USER_PASSWORD;
    public readonly USER_PASSWORD_CONFIRM_PROPERTY: string = PersonalSettingsProperty.USER_PASSWORD_CONFIRM;

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === this.USER_PASSWORD_PROPERTY
            || formField.property === this.USER_PASSWORD_CONFIRM_PROPERTY;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const password = await formInstance.getFormFieldValueByProperty<string>(
            this.USER_PASSWORD_PROPERTY
        );

        if (password && password.value) {
            if (formField.property === this.USER_PASSWORD_CONFIRM_PROPERTY) {
                const passwordConfirm = await formInstance.getFormFieldValueByProperty<string>(
                    this.USER_PASSWORD_CONFIRM_PROPERTY
                );

                if (!this.isDefined(passwordConfirm)) {
                    const errorString = await TranslationService.translate(
                        'Translatable#You have to confirm your password.'
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }

                if (passwordConfirm.value !== password.value) {
                    const errorString = await TranslationService.translate(
                        'Translatable#Passwords do not match.'
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private isDefined(value: FormFieldValue): boolean {
        return value && value.value && value.value !== '';
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

}
