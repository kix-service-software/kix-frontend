/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { Contact } from '../../../model/Contact';
import { ContactProperty } from '../../../model/ContactProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContactEmailFormValue } from './form-values/ContactEmailFormValue';
import { TextAreaFormValue } from '../../../../object-forms/model/FormValues/TextAreaFormValue';
import { IconFormValue } from '../../../../object-forms/model/FormValues/IconFormValue';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { PrimaryOrganisationFormValue } from './form-values/PrimaryOrganisationFormValue';
import { ContactUserFormValue } from './form-values/ContactUserFormValue';

export class ContactObjectFormValueMapper extends ObjectFormValueMapper<Contact> {

    public async mapObjectValues(contact: Contact): Promise<void> {
        for (const property in contact) {
            if (!Object.prototype.hasOwnProperty.call(contact, property)) {
                continue;
            }

            await this.mapContactAttribute(property, contact);
        }

        const iconFormValue = new IconFormValue('ICON', contact, this, null);
        await iconFormValue.setFormValue(new ObjectIcon(null, KIXObjectType.CONTACT, contact?.ID));
        this.formValues.push(iconFormValue);

        const userFormValue = new ContactUserFormValue(ContactProperty.USER, contact, this, null);
        this.formValues.push(userFormValue);

        await super.mapObjectValues(contact);
    }

    protected async mapContactAttribute(property: string, contact: Contact): Promise<void> {
        switch (property) {
            case ContactProperty.ORGANISATION_IDS:
                const organisationsFormValue = new SelectObjectFormValue(property, contact, this, null);
                organisationsFormValue.objectType = KIXObjectType.ORGANISATION;
                organisationsFormValue.isAutoComplete = true;
                organisationsFormValue.maxSelectCount = -1;
                this.formValues.push(organisationsFormValue);
                break;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                const primaryOrganisationFormValue = new PrimaryOrganisationFormValue(property, contact, this, null);
                primaryOrganisationFormValue.objectType = KIXObjectType.ORGANISATION;
                this.formValues.push(primaryOrganisationFormValue);
                break;
            case ContactProperty.EMAIL:
                const mailFormValue = new ContactEmailFormValue(property, contact, this, null);
                this.formValues.push(mailFormValue);
                break;
            case ContactProperty.COMMENT:
                const commentFormValue = new TextAreaFormValue(property, contact, this, null);
                this.formValues.push(commentFormValue);
                break;
            case KIXObjectProperty.VALID_ID:
                const validFormValue = new SelectObjectFormValue(property, contact, this, null);
                validFormValue.objectType = KIXObjectType.VALID_OBJECT;
                this.formValues.push(validFormValue);
                break;
            case ContactProperty.FIRSTNAME:
            case ContactProperty.LASTNAME:
            case ContactProperty.TITLE:
            case ContactProperty.CITY:
            case ContactProperty.STREET:
            case ContactProperty.COUNTRY:
            case ContactProperty.FAX:
            case ContactProperty.MOBILE:
            case ContactProperty.PHONE:
            case ContactProperty.ZIP:
                const formValue = new ObjectFormValue(property, contact, this, null);
                this.formValues.push(formValue);
            default:
        }
    }

}