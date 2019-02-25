import {
    IFormFieldValidator, FormField, ValidationResult, ValidationSeverity,
    ArticleProperty, FormFieldValue, SystemAddress, KIXObjectType
} from "../../../../model";
import { FormService } from "../../..";
import { KIXObjectService } from "../../../kix";

export class EmailRecipientValidator implements IFormFieldValidator {

    // tslint:disable-next-line:max-line-length
    private EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    public isValidatorFor(formField: FormField, formId: string): boolean {
        return formField.property === ArticleProperty.TO
            || formField.property === ArticleProperty.CC
            || formField.property === ArticleProperty.BCC;
    }

    public async validate(formField: FormField, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const toValue = await formInstance.getFormFieldValueByProperty<string>(ArticleProperty.TO);
        const ccValue = await formInstance.getFormFieldValueByProperty<string>(ArticleProperty.CC);
        const bccValue = await formInstance.getFormFieldValueByProperty<string>(ArticleProperty.BCC);

        if (this.isDefined(toValue) || this.isDefined(ccValue) || this.isDefined(bccValue)) {
            let value;
            if (formField.property === ArticleProperty.TO) {
                value = toValue.value;
            } else if (formField.property === ArticleProperty.CC) {
                value = ccValue.value;
            } else if (formField.property === ArticleProperty.BCC) {
                value = bccValue.value;
            }

            const mailCheckResult = await this.checkEmail(value);
            if (mailCheckResult.severity === ValidationSeverity.ERROR) {
                return mailCheckResult;
            }
        } else {
            return new ValidationResult(
                ValidationSeverity.ERROR, 'Mindestens eines der Felder An, Cc oder Bcc muss eine Eingabe beinhalten.'
            );
        }

        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private isDefined(value: FormFieldValue): boolean {
        return value && value.value && value.value !== '';
    }

    private async checkEmail(value: string): Promise<ValidationResult> {
        if (value && value !== '') {
            const mailAddresses = value.split(',');
            for (const mail of mailAddresses) {
                if (!this.EMAIL_REGEX.test(mail.trim()) === true) {
                    return new ValidationResult(
                        ValidationSeverity.ERROR, 'Eingegebene E-Mail Adresse ist ungültig.'
                    );
                }

                if (await this.isSystemAddress(mail)) {
                    return new ValidationResult(
                        ValidationSeverity.ERROR, 'Eingegebene E-Mail Adresse darf keine Systemaddresse sein.'
                    );
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
