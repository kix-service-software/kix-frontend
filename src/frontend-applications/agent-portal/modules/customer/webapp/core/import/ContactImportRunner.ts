/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../../../server/model/Error';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ImportRunner } from '../../../../import/webapp/core/ImportRunner';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { User } from '../../../../user/model/User';
import { UserProperty } from '../../../../user/model/UserProperty';
import { Contact } from '../../../model/Contact';
import { ContactProperty } from '../../../model/ContactProperty';
import { Organisation } from '../../../model/Organisation';
import { OrganisationProperty } from '../../../model/OrganisationProperty';

export class ContactImportRunner extends ImportRunner {

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    protected getKnownProperties(): string[] {
        return Object.values(ContactProperty);
    }

    protected async prepareParameter(object: Contact): Promise<Array<[string, any]>> {
        const parameter = await super.prepareParameter(object);

        const existingContact = await this.getExisting(object);
        let existingUser: User | undefined;
        if (object.User?.UserLogin) {
            const result = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, null,
                new KIXObjectLoadingOptions([
                    new FilterCriteria(
                        UserProperty.USER_LOGIN, SearchOperator.EQUALS,
                        FilterDataType.STRING, FilterType.AND, object.User.UserLogin
                    )
                ])
            );

            existingUser = Array.isArray(result) && result.length > 0 ? result[0] : undefined;

            if (existingUser) {
                if ((existingContact as Contact)?.AssignedUserID !== existingUser.UserID) {
                    throw new Error(
                        null,
                        await TranslationService.translate('Translatable#User is already assigned'));
                }
                parameter.push([ContactProperty.ASSIGNED_USER_ID, existingUser.UserID]);
            }
        }

        return parameter;
    }

    protected async getSpecificObject(object: Contact): Promise<Contact> {
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

    public async getRequiredProperties(): Promise<string[]> {
        return [ContactProperty.EMAIL];
    }

    public getAlternativeProperty(property: string): string {
        if (property === ContactProperty.PRIMARY_ORGANISATION_ID) {
            return ContactProperty.PRIMARY_ORGANISATION_NUMBER;
        } else {
            return super.getAlternativeProperty(property);
        }
    }

    public async getColumnProperties(): Promise<string[]> {
        const columnProperties = super.getCSVColumns();
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

    protected async getExisting(contact: Contact): Promise<KIXObject> {
        if (contact.ObjectId) {
            return super.getExisting(contact);
        } else {
            const filter = [
                new FilterCriteria(
                    ContactProperty.EMAIL, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, contact.Email
                ),
                new FilterCriteria(
                    ContactProperty.FIRSTNAME, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, contact.Firstname
                ),
                new FilterCriteria(
                    ContactProperty.LASTNAME, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, contact.Lastname
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
