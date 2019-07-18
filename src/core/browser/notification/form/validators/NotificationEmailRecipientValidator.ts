/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IFormFieldValidator, FormField, ValidationResult, ValidationSeverity,
    FormFieldValue, SystemAddress, KIXObjectType, NotificationProperty
} from "../../../../model";
import { FormService } from "../../..";
import { KIXObjectService } from "../../../kix";
import { FormValidationService } from "../../../form/validation";
import { TranslationService } from "../../../i18n/TranslationService";

export class NotificationEmailRecipientValidator implements IFormFieldValidator {

    public validatorId: string = 'NotificationEmailRecipientValidator';

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.property === NotificationProperty.DATA_RECIPIENT_EMAIL;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const emailValue = await formInstance.getFormFieldValueByProperty<string[]>(
            NotificationProperty.DATA_RECIPIENT_EMAIL
        );

        if (this.isDefined(emailValue)) {
            const mailCheckResult = await this.checkEmail(emailValue.value);
            if (mailCheckResult.severity === ValidationSeverity.ERROR) {
                return mailCheckResult;
            }
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private isDefined(value: FormFieldValue): boolean {
        return value && value.value && !!value.value.length && value.value[0] !== '';
    }

    private async checkEmail(value: string[]): Promise<ValidationResult> {
        if (value && !!value.length) {
            const mailAddresses = value;
            for (const mail of mailAddresses) {
                if (!FormValidationService.getInstance().isValidEmail(mail)) {
                    const errorString = await TranslationService.translate(
                        `${FormValidationService.EMAIL_REGEX_ERROR_MESSAGE} ({0}).`, [mail]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }

                if (await this.isSystemAddress(mail.replace(/.+ <(.+)>/, '$1'))) {
                    const errorString = await TranslationService.translate(
                        'Translatable#Inserted email address must not be a system address ({0}).', [mail]
                    );
                    return new ValidationResult(ValidationSeverity.ERROR, errorString);
                }
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async isSystemAddress(mail: string): Promise<boolean> {
        const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(KIXObjectType.SYSTEM_ADDRESS);
        if (systemAddresses) {
            return systemAddresses.some((sa) => sa.Name === mail);
        }

        return false;
    }

}
