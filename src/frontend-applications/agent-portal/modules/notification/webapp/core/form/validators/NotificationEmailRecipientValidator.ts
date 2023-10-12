/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { FormValidationService } from '../../../../../../modules/base-components/webapp/core/FormValidationService';
import { IFormFieldValidator } from '../../../../../../modules/base-components/webapp/core/IFormFieldValidator';
import { KIXObjectService } from '../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ValidationResult } from '../../../../../../modules/base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../../../../modules/base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DynamicField } from '../../../../../dynamic-fields/model/DynamicField';
import { SystemAddress } from '../../../../../system-address/model/SystemAddress';
import { NotificationProperty } from '../../../../model/NotificationProperty';

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
            const mailAddresses = Array.isArray(value) ? value : [value];
            for (const mail of mailAddresses) {
                if (!(/^<KIX_.*>$/gi.test(mail))) {
                    if (!FormValidationService.getInstance().isValidEmail(mail)) {
                        const errorString = await TranslationService.translate(
                            `${ FormValidationService.EMAIL_REGEX_ERROR_MESSAGE } ({0}).`, [mail]
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
