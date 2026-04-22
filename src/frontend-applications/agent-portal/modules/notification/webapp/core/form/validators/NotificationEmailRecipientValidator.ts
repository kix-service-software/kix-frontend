/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../../model/configuration/FormFieldValue';
import { FormValidationService } from '../../../../../../modules/base-components/webapp/core/FormValidationService';
import { IFormFieldValidator } from '../../../../../../modules/base-components/webapp/core/IFormFieldValidator';
import { ValidationResult } from '../../../../../../modules/base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DynamicField } from '../../../../../dynamic-fields/model/DynamicField';
import { SystemAddressService } from '../../../../../system-address/webapp/core';
import { NotificationProperty } from '../../../../model/NotificationProperty';
import addrparser from 'address-rfc2822';

export class NotificationEmailRecipientValidator implements IFormFieldValidator {

    public validatorId: string = 'NotificationEmailRecipientValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === NotificationProperty.DATA_RECIPIENT_EMAIL;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const emailValue = await formInstance.getFormFieldValueByProperty<string[]>(
            NotificationProperty.DATA_RECIPIENT_EMAIL
        );

        if (this.isDefined(emailValue)) {
            const emailAddresses: string[] = [];
            emailValue.value.forEach((v) => {
                emailAddresses.push(...this.parseAddresses(v));
            });
            const mailCheckResult = await this.checkEmail(emailAddresses);
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
            const mailAddresses = Array.isArray(value) ? value : [value];
            for (const mail of mailAddresses) {
                if (!(/^<KIX_.*>$/gi.test(mail))) {
                    if (!FormValidationService.getInstance().isValidEmail(mail)) {
                        const errorString = await TranslationService.translate(
                            `${FormValidationService.EMAIL_REGEX_ERROR_MESSAGE} ({0}).`, [mail]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }

                    if (await SystemAddressService.getInstance().isSystemAddress(mail)) {
                        const errorString = await TranslationService.translate(
                            'Translatable#Inserted email address must not be a system address ({0}).', [mail]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }
                }
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private parseAddresses(value: string): string[] {
        const emailAddresses = [];
        try {
            const parseResult = addrparser.parse(value);
            for (const address of parseResult) {
                if (address.phrase && address.phrase !== address.address) {
                    emailAddresses.push(`"${address.phrase}" <${address.address}>`);
                } else {
                    emailAddresses.push(address.address);
                }
            }
        } catch (error) {
            emailAddresses.push(value);
        }
        return emailAddresses;
    }

}
