import { ValidationResult } from '../../../../../../base-components/webapp/core/ValidationResult';
import { ContactService } from '../../../../../../customer/webapp/core/ContactService';
import { ObjectFormValue } from '../../../../../../object-forms/model/FormValues/ObjectFormValue';
import { TicketProperty } from '../../../../../model/TicketProperty';
import { EmailRecipientValidator } from './EmailRecipientValidator';

export class ContactFormValueValidator extends EmailRecipientValidator {

    public async validate(formValue: ObjectFormValue): Promise<ValidationResult[]> {
        const result: ValidationResult[] = [];
        if (
            formValue.property === TicketProperty.CONTACT_ID &&
            !formValue.objectValueMapper?.objectFormHandler?.configurationMode
        ) {
            if (isNaN(formValue.value)) {
                result.push(await this.checkEmail([...this.parseAddresses(formValue.value)]));
            } else {
                const contact = await ContactService.getInstance().getContactById(formValue.value);
                if (contact) {
                    result.push(await this.checkEmail([...this.parseAddresses(contact.Email)]));
                }
            }

        }
        return result;
    }



}