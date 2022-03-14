/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { AgentService } from './AgentService';

export class UserPasswordValidator implements IFormFieldValidator {

    public validatorId: string = 'UserPasswordValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === PersonalSettingsProperty.CURRENT_PASSWORD
            || formField.property === PersonalSettingsProperty.USER_PASSWORD
            || formField.property === PersonalSettingsProperty.USER_PASSWORD_CONFIRM;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const password = await formInstance.getFormFieldValueByProperty<string>(
            PersonalSettingsProperty.USER_PASSWORD
        );

        if (password && password.value) {
            if (formField.property === PersonalSettingsProperty.USER_PASSWORD_CONFIRM) {
                const passwordConfirm = await formInstance.getFormFieldValueByProperty<string>(
                    PersonalSettingsProperty.USER_PASSWORD_CONFIRM
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

            if (formField.property === PersonalSettingsProperty.CURRENT_PASSWORD) {
                const currentPassword = await formInstance.getFormFieldValueByProperty<string>(
                    PersonalSettingsProperty.CURRENT_PASSWORD
                );

                if (!this.isDefined(currentPassword)) {
                    const errorString = await TranslationService.translate(
                        'Translatable#You have to confirm your current password.'
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }

                if (!await this.checkCurrentPassword(currentPassword.value)) {
                    const errorString = await TranslationService.translate(
                        'Translatable#Your current password is wrong.'
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

    private async checkCurrentPassword(currentPassword: string): Promise<boolean> {
        return await AgentService.getInstance().checkPassword(currentPassword);
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

}
