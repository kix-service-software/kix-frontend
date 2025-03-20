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
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

export class ContactObjectFormValueMapper extends ObjectFormValueMapper<Contact> {

    public async mapObjectValues(contact: Contact): Promise<void> {
        await this.mapContactAttributes(contact);

        const iconFormValue = new IconFormValue('ICON', contact, this, null);
        await iconFormValue.setFormValue(new ObjectIcon(null, KIXObjectType.CONTACT, contact?.ID));
        this.formValues.push(iconFormValue);

        const userFormValue = new ContactUserFormValue(ContactProperty.USER, contact, this, null);
        this.formValues.push(userFormValue);

        await super.mapObjectValues(contact);
    }

    protected async mapContactAttributes(contact: Contact): Promise<void> {
        const organisationsFormValue = new SelectObjectFormValue(
            ContactProperty.ORGANISATION_IDS, contact, this, null
        );
        organisationsFormValue.objectType = KIXObjectType.ORGANISATION;
        organisationsFormValue.isAutoComplete = true;
        organisationsFormValue.maxSelectCount = -1;
        this.formValues.push(organisationsFormValue);

        const primaryOrganisationFormValue = new PrimaryOrganisationFormValue(
            ContactProperty.PRIMARY_ORGANISATION_ID, contact, this, null
        );
        primaryOrganisationFormValue.objectType = KIXObjectType.ORGANISATION;
        this.formValues.push(primaryOrganisationFormValue);

        const mailFormValue = new ContactEmailFormValue(ContactProperty.EMAIL, contact, this, null);
        this.formValues.push(mailFormValue);

        const commentFormValue = new TextAreaFormValue(ContactProperty.COMMENT, contact, this, null);
        this.formValues.push(commentFormValue);

        const validFormValue = new SelectObjectFormValue(
            KIXObjectProperty.VALID_ID, contact, this, null
        );
        validFormValue.objectType = KIXObjectType.VALID_OBJECT;
        this.formValues.push(validFormValue);

        this.formValues.push(new ObjectFormValue(ContactProperty.FIRSTNAME, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.LASTNAME, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.TITLE, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.CITY, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.STREET, contact, this, null));

        const field = this.objectFormHandler?.findFormFieldByProperty(ContactProperty.COUNTRY);
        if (field?.inputComponent === 'default-select-input') {
            const nodesOption = field?.options?.find((o) => o.option === 'NODES');
            if (Array.isArray(nodesOption?.value)) {
                const countryFormValue = new SelectObjectFormValue(ContactProperty.COUNTRY, contact, this, null);
                (countryFormValue as any).prepareSelectableNodes = async (objects: KIXObject[]): Promise<void> => {
                    const nodes = [];
                    for (const node of nodesOption.value) {
                        node.label = await TranslationService.translate(node.label);
                        nodes.push(node);
                    }
                    countryFormValue.treeHandler?.setTree(nodes, undefined, true, true);
                };
                this.formValues.push(countryFormValue);
            }
        } else {
            const countryFormValue = new ObjectFormValue(ContactProperty.COUNTRY, contact, this, null);
            this.formValues.push(countryFormValue);
        }

        this.formValues.push(new ObjectFormValue(ContactProperty.FAX, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.MOBILE, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.PHONE, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.ZIP, contact, this, null));

    }

}