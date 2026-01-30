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
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { UserProperty } from '../../../../user/model/UserProperty';
import { UserAccessFormValue } from './form-values/UserAccessFormValue';
import { User } from '../../../../user/model/User';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { FormLayout } from '../../../../object-forms/model/layout/FormLayout';
import { RowColumnLayout } from '../../../../object-forms/model/layout/RowColumnLayout';
import { GroupLayout } from '../../../../object-forms/model/layout/GroupLayout';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';

export class ContactObjectFormValueMapper extends ObjectFormValueMapper<Contact> {

    public async mapFormValues(contact: Contact): Promise<void> {
        if (!contact.User) {
            contact.User = new User();
        }

        const hasUserCreatePermission = await AgentService.checkPermissions('system/users', [CRUD.CREATE]);
        if (hasUserCreatePermission) {
            this.createUserPage();
        }

        return super.mapFormValues(contact);
    }

    // eslint-disable-next-line max-lines-per-function
    private createUserPage(): void {
        const page = new FormPageConfiguration('user-form-page', 'Translatable#User Information');
        const userGroup = new FormGroupConfiguration('user-form-group', 'Translatable#User Access');
        page.groups.push(userGroup);

        const userPasswordConfiguration = new FormFieldConfiguration(
            'user-form-user-password', 'Translatable#Password', UserProperty.USER_PASSWORD, null
        );

        userPasswordConfiguration.options = [
            new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
        ];

        userGroup.formFields.push(
            new FormFieldConfiguration(
                'user-form-user-access', 'Translatable#Access', UserProperty.USER_ACCESS, null
            ),
            new FormFieldConfiguration(
                'user-form-user-login', 'Translatable#Login Name', UserProperty.USER_LOGIN, null, true
            ),
            userPasswordConfiguration,
            new FormFieldConfiguration(
                'user-form-user-roles', 'Translatable#Roles', UserProperty.ROLE_IDS, null
            ),
        );

        const preferencesGroup = new FormGroupConfiguration(
            'user-preferences-form-group', 'Translatable#User Preferences'
        );
        page.groups.push(preferencesGroup);
        preferencesGroup.formFields.push(
            new FormFieldConfiguration(
                'user-form-user-ooo', 'Translatable#Out Of Office', UserProperty.OUT_OF_OFFICE, null
            ),
            new FormFieldConfiguration(
                'user-form-user-preferences', 'Translatable#Preferences', UserProperty.PREFERENCES, null
            )
        );

        if (!this.form.formLayout) {
            this.form.formLayout = new FormLayout();
        }
        const groupLayout = new GroupLayout(userGroup.id);
        groupLayout.rowLayout.push(
            [
                new RowColumnLayout(['user-form-user-access'], 12, 12, 4),
                new RowColumnLayout(['user-form-user-login'], 12, 6, 4),
                new RowColumnLayout(['user-form-user-password'], 12, 6, 4),
                new RowColumnLayout(['user-form-user-roles'], 12, 6, 12)
            ]
        );
        this.form.formLayout.groupLayout?.push(groupLayout);

        this.form.pages.push(page);
    }

    public async mapObjectValues(contact: Contact): Promise<void> {
        await this.mapContactAttributes(contact);

        const iconFormValue = new IconFormValue('ICON', contact, this, null);
        await iconFormValue.setFormValue(new ObjectIcon(null, KIXObjectType.CONTACT, contact?.ID));
        this.formValues.push(iconFormValue);

        const userAccessFormValue = new UserAccessFormValue(
            UserProperty.USER_ACCESS, contact.User, this, null
        );
        this.formValues.push(userAccessFormValue);

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
        this.formValues.push(new ObjectFormValue(ContactProperty.STREET, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.FAX, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.MOBILE, contact, this, null));
        this.formValues.push(new ObjectFormValue(ContactProperty.PHONE, contact, this, null));

        this.formValues.push(await this.setSelectFormValue(ContactProperty.TITLE, contact));
        this.formValues.push(await this.setSelectFormValue(ContactProperty.COUNTRY, contact));
        this.formValues.push(await this.setSelectFormValue(ContactProperty.ZIP, contact));
        this.formValues.push(await this.setSelectFormValue(ContactProperty.CITY, contact));

    }

    protected async setSelectFormValue(property: string, contact: Contact): Promise<ObjectFormValue> {
        const field = this.objectFormHandler?.findFormFieldByProperty(property);

        if (field?.inputComponent === 'default-select-input') {
            const nodesOption = field?.options?.find((o) => o.option === 'NODES');
            if (Array.isArray(nodesOption?.value)) {
                const formValue = new SelectObjectFormValue(property, contact, this, null);
                (formValue as any).prepareSelectableNodes = async (objects: KIXObject[]): Promise<void> => {
                    const nodes = [];
                    for (const node of nodesOption.value) {
                        node.label = await TranslationService.translate(node.label);
                        nodes.push(node);
                    }
                    formValue.treeHandler?.setTree(nodes, undefined, true, true);
                };
                return formValue;
            }
        }

        return new ObjectFormValue(property, contact, this, null);
    }

}