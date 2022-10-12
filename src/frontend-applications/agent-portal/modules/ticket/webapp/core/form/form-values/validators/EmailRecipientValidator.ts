/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../../../../../system-address/model/SystemAddress';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ObjectFormValueValidator } from '../../../../../../object-forms/webapp/core/validation/ObjectFormValueValidator';
import { ObjectFormValue } from '../../../../../../object-forms/model/FormValues/ObjectFormValue';
import { RecipientFormValue } from '../RecipientFormValue';
import addrparser from 'address-rfc2822';

export class EmailRecipientValidator implements ObjectFormValueValidator {

    public async validate(formValue: ObjectFormValue<any>): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];
        if (formValue instanceof RecipientFormValue) {
            const value = formValue.value;
            const hasValue = typeof value !== 'undefined' && value !== null && value.length;
            if (hasValue) {

                const recipientValues: any[] = value.filter((v) => v !== null && typeof v !== 'undefined');

                // no check for contact ids necessary, they should already be replaced with their email address
                const emailAddresses: string[] = [];
                // TODO: placeholders may be valid sometime - add handling/ignore
                for (let value of recipientValues) {
                    value = value.replace(/^(.*?),$/, '$1');
                    emailAddresses.push(...this.parseAddresses(value));
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

    private async checkEmail(value: string[]): Promise<ValidationResult> {
        if (value && !!value.length) {
            const mailAddresses = Array.isArray(value) ? value : [value];
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
