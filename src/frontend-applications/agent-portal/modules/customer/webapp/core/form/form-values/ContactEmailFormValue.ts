/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Contact } from '../../../../model/Contact';
import { ContactProperty } from '../../../../model/ContactProperty';

export class ContactEmailFormValue extends ObjectFormValue<string> {

    public constructor(
        property: string,
        contact: Contact,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, contact, objectValueMapper, parent);

        for (let i = 1; i < 6; i++) {
            this.formValues.push(new ObjectFormValue(ContactProperty.EMAIL + i, contact, objectValueMapper, this));
        }
    }

}