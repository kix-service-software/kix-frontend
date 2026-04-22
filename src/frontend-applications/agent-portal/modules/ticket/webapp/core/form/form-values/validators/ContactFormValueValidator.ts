/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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