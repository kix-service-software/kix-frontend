/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormFieldValidator } from '../../../../../../modules/base-components/webapp/core/IFormFieldValidator';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { ValidationResult } from '../../../../../../modules/base-components/webapp/core/ValidationResult';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ContextMode } from '../../../../../../model/ContextMode';
import { TicketProperty } from '../../../../model/TicketProperty';
import { FormFieldValue } from '../../../../../../model/configuration/FormFieldValue';
import { ValidationSeverity } from '../../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { FormValidationService } from '../../../../../../modules/base-components/webapp/core/FormValidationService';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { SystemAddress } from '../../../../../system-address/model/SystemAddress';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { DynamicField } from '../../../../../dynamic-fields/model/DynamicField';

export class EmailRecipientValidator implements IFormFieldValidator {

    public validatorId: string = 'EmailRecipientValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === ArticleProperty.TO
            || formField.property === ArticleProperty.CC
            || formField.property === ArticleProperty.BCC;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        let toValue = await formInstance.getFormFieldValueByProperty<string[]>(ArticleProperty.TO);
        let checkToValue = true;
        if (!this.isDefined(toValue)) {
            if (context && context.descriptor.contextMode === ContextMode.CREATE) {
                const contactValue = await formInstance.getFormFieldValueByProperty<string>(TicketProperty.CONTACT_ID);
                if (contactValue) {
                    toValue = new FormFieldValue([contactValue.value], contactValue.valid);
                    checkToValue = false;
                }
            }
        }

        const ccValue = await formInstance.getFormFieldValueByProperty<string[]>(ArticleProperty.CC);
        const bccValue = await formInstance.getFormFieldValueByProperty<string[]>(ArticleProperty.BCC);

        if (this.isDefined(toValue) || this.isDefined(ccValue) || this.isDefined(bccValue)) {
            let value;
            if (formField.property === ArticleProperty.TO && toValue) {
                value = toValue.value;
            } else if (formField.property === ArticleProperty.CC && ccValue) {
                value = ccValue.value;
            } else if (formField.property === ArticleProperty.BCC && bccValue) {
                value = bccValue.value;
            }

            if (formField.property !== ArticleProperty.TO || checkToValue) {
                const mailCheckResult = await this.checkEmail(value);
                if (mailCheckResult.severity === ValidationSeverity.ERROR) {
                    return mailCheckResult;
                }
            }
        } else if (checkToValue) {
            return new ValidationResult(
                ValidationSeverity.ERROR,
                await TranslationService.translate(
                    'Translatable#At least one of the fields To, Cc or Bcc must contain an entry.'
                )
            );
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

    public isValidatorForDF(dynamicField: DynamicField): boolean {
        return false;
    }

    public async validateDF(dynamicField: DynamicField, value: any): Promise<ValidationResult> {
        return new ValidationResult(ValidationSeverity.OK, '');
    }

}
