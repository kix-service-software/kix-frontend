/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    PersonalSettingsProperty, FormField, IFormFieldValidator, ValidationResult, FormFieldValue, ValidationSeverity
} from "../../model";
import { FormService } from "../form";
import { TranslationService } from "../i18n/TranslationService";
import { AgentService } from "../application/AgentService";

export class UserPasswordValidator implements IFormFieldValidator {

    public validatorId: string = 'UserPasswordValidator';

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.property === PersonalSettingsProperty.CURRENT_PASSWORD
            || formField.property === PersonalSettingsProperty.USER_PASSWORD
            || formField.property === PersonalSettingsProperty.USER_PASSWORD_CONFIRM;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);

        const currentPassword = await formInstance.getFormFieldValueByProperty<string>(
            PersonalSettingsProperty.CURRENT_PASSWORD
        );
        const password = await formInstance.getFormFieldValueByProperty<string>(
            PersonalSettingsProperty.USER_PASSWORD
        );
        const passwordConfirm = await formInstance.getFormFieldValueByProperty<string>(
            PersonalSettingsProperty.USER_PASSWORD_CONFIRM
        );

        if (this.isDefined(password)) {

            if (!this.isDefined(passwordConfirm)) {
                const errorString = await TranslationService.translate(
                    "Translatable#You have to confirm your password."
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

            if (passwordConfirm.value !== password.value) {
                const errorString = await TranslationService.translate(
                    "Translatable#Passwords do not match."
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

            if (!this.isDefined(currentPassword)) {
                const errorString = await TranslationService.translate(
                    "Translatable#You have to confirm your current password."
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

            if (!await this.checkCurrentPassword(currentPassword.value)) {
                const errorString = await TranslationService.translate(
                    "Translatable#Your current password is wrong."
                );
                return new ValidationResult(ValidationSeverity.ERROR, errorString);
            }

        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private isDefined(value: FormFieldValue): boolean {
        return value && value.value && value.value !== '';
    }

    private async  checkCurrentPassword(currentPassword: string): Promise<boolean> {
        return await AgentService.getInstance().checkPassword(currentPassword);
    }

}
