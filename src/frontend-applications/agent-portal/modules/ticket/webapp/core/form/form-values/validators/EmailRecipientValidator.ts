/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValidationResult } from '../../../../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../../base-components/webapp/core/ValidationSeverity';
import { FormValidationService } from '../../../../../../base-components/webapp/core/FormValidationService';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { ObjectFormValueValidator } from '../../../../../../object-forms/webapp/core/validation/ObjectFormValueValidator';
import { ObjectFormValue } from '../../../../../../object-forms/model/FormValues/ObjectFormValue';
import { RecipientFormValue } from '../RecipientFormValue';
import addrparser from 'address-rfc2822';
import { SystemAddressService } from '../../../../../../system-address/webapp/core';
import { ContactService } from '../../../../../../customer/webapp/core/ContactService';

export class EmailRecipientValidator implements ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];
        if (
            formValue instanceof RecipientFormValue &&
            !formValue.objectValueMapper?.objectFormHandler?.configurationMode
        ) {
            const value = formValue.value;
            const hasValue = typeof value !== 'undefined' && value !== null && value.length;
            if (hasValue) {

                const recipientValues: any[] = Array.isArray(value) ?
                    value.filter((v) => v !== null && typeof v !== 'undefined') :
                    [value];

                // no check for contact ids necessary, they should already be replaced with their email address
                const emailAddresses: string[] = [];
                // TODO: placeholders may be valid sometime - add handling/ignore
                for (let value of recipientValues) {
                    if (isNaN(value)) {
                        value = value.replace(/^(.*?),$/, '$1');
                        emailAddresses.push(...this.parseAddresses(value));
                    } else {
                        const contact = await ContactService.getInstance().getContactById(value);
                        if (contact) {
                            emailAddresses.push(...this.parseAddresses(contact.Email));
                        }
                    }
                }

                if (emailAddresses.length) {
                    const mailCheckResult = await this.checkEmail(emailAddresses);
                    if (mailCheckResult.severity === ValidationSeverity.ERROR) {
                        result.push(mailCheckResult);
                    }

                }
            }
        }
        return result;
    }

    protected async checkEmail(
        value: string[]): Promise<ValidationResult> {
        if (value && !!value.length) {
            const mailAddresses = Array.isArray(value) ? value : [value];
            for (const mail of mailAddresses) {
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
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    protected parseAddresses(value: string): string[] {
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
