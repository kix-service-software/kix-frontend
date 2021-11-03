/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContactService } from '.';
import { Error } from '../../../../../../server/model/Error';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { SortUtil } from '../../../../model/SortUtil';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { Column } from '../../../base-components/webapp/core/table';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { ImportManager, ImportPropertyOperator } from '../../../import/webapp/core';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { User } from '../../../user/model/User';
import { UserProperty } from '../../../user/model/UserProperty';
import { Contact } from '../../model/Contact';
import { ContactProperty } from '../../model/ContactProperty';
import { Organisation } from '../../model/Organisation';
import { OrganisationProperty } from '../../model/OrganisationProperty';

export class ContactImportManager extends ImportManager {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    public reset(): void {
        super.reset();
        this.values.push(new ObjectPropertyValue(
            KIXObjectProperty.VALID_ID, ImportPropertyOperator.REPLACE_EMPTY, [1])
        );
    }

    public async execute(object: KIXObject, columns: Column[]): Promise<void> {
        this.importRun = true;
        if (object instanceof Contact) {
            await this.checkObject(object).then(async () => {
                const existingContact = await this.getExisting(object);
                const parameter: Array<[string, any]> = await this.prepareParameter(object, columns);
                let existingUser: User | undefined;
                if (object.User?.UserLogin) {
                    const result = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, null,
                        new KIXObjectLoadingOptions(
                            [new FilterCriteria(UserProperty.USER_LOGIN, SearchOperator.EQUALS,
                                FilterDataType.STRING,
                                FilterType.AND, object.User.UserLogin)
                            ]
                        ));

                    existingUser = Array.isArray(result) && result.length > 0 ? result[0] : undefined;

                    if (existingUser) {
                        if ((existingContact as Contact)?.AssignedUserID !== existingUser.UserID) {
                            throw new Error(null,
                                await TranslationService.translate('Translatable#User is already assigned'));
                        }
                        parameter.push([ContactProperty.ASSIGNED_USER_ID, existingUser.UserID]);
                    }
                }

                if (existingContact) {
                    await KIXObjectService.updateObject(this.objectType, parameter, existingContact.ObjectId, false);
                } else {
                    await KIXObjectService.createObject(this.objectType, parameter, null, false);
                }

            });
        }
    }

    protected async getSpecificObject(object: any): Promise<Contact> {
        if (object[ContactProperty.PRIMARY_ORGANISATION_ID]) {
            object[ContactProperty.PRIMARY_ORGANISATION_ID] = Number(object[ContactProperty.PRIMARY_ORGANISATION_ID]);
        } else if (object[ContactProperty.PRIMARY_ORGANISATION_NUMBER]) {
            const organisation = await this.getOrganisationByNumber(
                object[ContactProperty.PRIMARY_ORGANISATION_NUMBER]
            );
            if (organisation) {
                object[ContactProperty.PRIMARY_ORGANISATION_ID] = organisation.ID;
            }
        }

        const user = new User();
        user.IsAgent = Number(object[UserProperty.IS_AGENT]) || 0;
        user.IsCustomer = Number(object[UserProperty.IS_CUSTOMER]) || 0;
        user.UserLogin = object[UserProperty.USER_LOGIN] || '';
        object[KIXObjectType.USER] = user;

        return new Contact(object as Contact);
    }

    private async getOrganisationByNumber(number: string): Promise<Organisation> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    OrganisationProperty.NUMBER, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, number
                )
            ]
        );
        const primaryOrganisations = await KIXObjectService.loadObjects<Organisation>(
            KIXObjectType.ORGANISATION, null, loadingOptions, null, true
        ).catch((error) => console.error(error));
        return primaryOrganisations && !!primaryOrganisations.length ? primaryOrganisations[0] : null;
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                return InputFieldTypes.DROPDOWN;
            case ContactProperty.COMMENT:
                return InputFieldTypes.TEXT_AREA;
            case ContactProperty.PRIMARY_ORGANISATION_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                return super.getInputType(property);
        }
    }

    public async getInputTypeOptions(
        property: ContactProperty, operator: ImportPropertyOperator
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case ContactProperty.COMMENT:
                return [
                    ['maxLength', 250]
                ];
            default:
                return super.getInputTypeOptions(property, operator);
        }
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const properties: Array<[string, string]> = [];
        const attributes = [
            ContactProperty.CITY,
            ContactProperty.COMMENT,
            ContactProperty.COUNTRY,
            ContactProperty.EMAIL,
            ContactProperty.FAX,
            ContactProperty.FIRSTNAME,
            ContactProperty.LASTNAME,
            ContactProperty.MOBILE,
            ContactProperty.PHONE,
            ContactProperty.PRIMARY_ORGANISATION_ID,
            ContactProperty.STREET,
            ContactProperty.TITLE,
            ContactProperty.ZIP,
            KIXObjectProperty.VALID_ID,
            UserProperty.IS_AGENT,
            UserProperty.IS_CUSTOMER,
            UserProperty.USER_LOGIN
        ];
        for (const attribute of attributes) {
            const label = await LabelService.getInstance().getPropertyText(attribute, this.objectType);
            properties.push([attribute, label]);
        }

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [ContactProperty.EMAIL, ContactProperty.PRIMARY_ORGANISATION_ID];
    }

    public getAlternativeProperty(property: string): string {
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            return ContactProperty.PRIMARY_ORGANISATION_NUMBER;
        } else {
            return super.getAlternativeProperty(property);
        }
    }

    public async getColumnProperties(): Promise<string[]> {
        const columnProperties = await super.getColumnProperties();
        if (!columnProperties.find((p) => p === UserProperty.USER_LOGIN)) {
            [UserProperty.IS_AGENT, UserProperty.IS_CUSTOMER].forEach((value) => {
                const index = columnProperties.indexOf(value);
                if (index > 0) {
                    columnProperties.splice(index, 1);
                }
            });
        }
        return columnProperties;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        return await ContactService.getInstance().getTreeNodes(property);
    }

    protected async getExisting(contact: Contact): Promise<KIXObject> {
        if (contact.ObjectId) {
            return super.getExisting(contact);
        } else {
            const filter = [
                new FilterCriteria(
                    ContactProperty.EMAIL, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, contact.Email
                )
            ];
            const loadingOptions = new KIXObjectLoadingOptions(filter);
            const contacts = await KIXObjectService.loadObjects(
                this.objectType, null, loadingOptions, null, true
            );
            return contacts && !!contacts.length ? contacts[0] : null;
        }
    }
}
