/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { ContactProperty } from '../model/ContactProperty';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { CreateContact } from './api/CreateContact';
import { CreateContactResponse } from './api/CreateContactResponse';
import { CreateContactRequest } from './api/CreateContactRequest';
import { UpdateContact } from './api/UpdateContact';
import { UpdateContactResponse } from './api/UpdateContactResponse';
import { UpdateContactRequest } from './api/UpdateContactRequest';
import { Error } from '../../../../../server/model/Error';
import { UserProperty } from '../../user/model/UserProperty';
import { UserService } from '../../user/server/UserService';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { PersonalSettingsProperty } from '../../user/model/PersonalSettingsProperty';
import { Contact } from '../model/Contact';
import { SearchOperator } from '../../search/model/SearchOperator';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { SearchProperty } from '../../search/model/SearchProperty';
import { CacheService } from '../../../server/services/cache';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { KIXObject } from '../../../model/kix/KIXObject';
import { ObjectResponse } from '../../../server/services/ObjectResponse';

export class ContactAPIService extends KIXObjectAPIService {

    private static INSTANCE: ContactAPIService;

    protected enableSearchQuery: boolean = false;

    public static getInstance(): ContactAPIService {
        if (!ContactAPIService.INSTANCE) {
            ContactAPIService.INSTANCE = new ContactAPIService();
        }
        return ContactAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'contacts';

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    protected getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        let objectClass;

        if (objectType === KIXObjectType.CONTACT) {
            objectClass = Contact;
        }
        return objectClass;
    }

    public async loadDisplayValue(objectType: KIXObjectType | string, objectId: string | number): Promise<string> {
        let displayValue = '';

        if (objectType === KIXObjectType.CONTACT) {
            const cacheKey = `${objectType}-${objectId}-displayvalue`;
            displayValue = await CacheService.getInstance().get(cacheKey, objectType);
            if (!displayValue && objectId) {
                const loadingOptions = new KIXObjectLoadingOptions();
                loadingOptions.includes = [ContactProperty.USER];

                const config = ConfigurationService.getInstance().getServerConfiguration();
                const objectResponse = await this.loadObjects<Contact>(
                    config?.BACKEND_API_TOKEN, 'ContactAPIService', objectType, [objectId], loadingOptions
                );

                const contacts = objectResponse?.objects || [];
                if (contacts?.length) {
                    const contact = new Contact(contacts[0]);
                    displayValue = contact.toString();
                    await CacheService.getInstance().set(cacheKey, displayValue, objectType);
                }
            }
        }

        return displayValue;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ObjectResponse<T>> {
        let objectResponse = new ObjectResponse<Contact>();

        if (objectType === KIXObjectType.CONTACT) {

            const preload = await this.shouldPreload(token, KIXObjectType.CONTACT);

            if (loadingOptions || !preload) {
                objectResponse = await super.load<Contact>(
                    token, KIXObjectType.CONTACT, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.CONTACT,
                    clientRequestId, Contact
                );
            } else {
                objectResponse = await super.load(
                    token, KIXObjectType.CONTACT, this.RESOURCE_URI, null, null, KIXObjectType.CONTACT,
                    clientRequestId, Contact
                );

                if (Array.isArray(objectIds) && objectIds.length) {
                    objectResponse.objects = objectResponse.objects?.filter(
                        (o) => objectIds.some((oid) => Number(oid) === o.ID)
                    );
                }
            }
        }

        return objectResponse as any;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {

        const userParameter = this.getUserParameters(parameter);

        const contactParameter = parameter.filter(
            (p) => !userParameter.some((up) => up[0] === p[0]) || p[0] === KIXObjectProperty.VALID_ID
        );
        this.prepareOrganisationIdsParameter(contactParameter);

        const createContact = new CreateContact(contactParameter);
        const response = await this.sendCreateRequest<CreateContactResponse, CreateContactRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateContactRequest(createContact),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        let userId;
        if (userParameter.length) {
            const assignedUserId = this.getParameterValue(parameter, ContactProperty.ASSIGNED_USER_ID);
            userId = await this.createOrUpdateUser(token, clientRequestId, userParameter, assignedUserId).catch(
                (error: Error) => {
                    LoggingService.getInstance().error(
                        `${error.Code}: Could not create or update user for contact ${error.Message}`, error
                    );
                    throw new Error(error.Code, error.Message);
                }
            );
            if (!assignedUserId && userId) {
                await this.updateObject(
                    token, clientRequestId, KIXObjectType.CONTACT,
                    [[ContactProperty.ASSIGNED_USER_ID, userId]], response.ContactID
                );
            }
        }

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon && icon.Content) {
            icon.Object = objectType;
            icon.ObjectID = response.ContactID;
            await this.createIcon(token, clientRequestId, icon)
                .catch(() => {
                    // be silent
                });
        }

        return response.ContactID;
    }

    private async createOrUpdateUser(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, assignedUserId?: number
    ): Promise<string | number> {
        let userId: string | number = assignedUserId;

        const validParameterValue = this.getParameterValue(parameter, KIXObjectProperty.VALID_ID);
        parameter = parameter.filter((p) => p[0] !== UserProperty.USER_ACCESS && p[0] !== KIXObjectProperty.VALID_ID);

        const isAgent = this.getParameterValue(parameter, UserProperty.IS_AGENT);
        const isCustomer = this.getParameterValue(parameter, UserProperty.IS_CUSTOMER);

        // use own valid (do not overwrite contact valid - reference)
        const validValue = (!isAgent && !isCustomer) || (validParameterValue && validParameterValue !== 1) ? 2 : 1;
        parameter.push([KIXObjectProperty.VALID_ID, validValue]);

        if (userId) {
            await UserService.getInstance().updateObject(
                token, clientRequestId, KIXObjectType.USER, parameter, userId
            ).catch((error) => {
                throw new Error(error.Code, error.Message);
            });
        } else if (isAgent || isCustomer) {
            userId = await UserService.getInstance().createObject(
                token, clientRequestId, KIXObjectType.USER, parameter
            ).catch((error) => {
                throw new Error(error.Code, error.Message);
            });
        }
        return userId;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        let userId;
        const userParameter = this.getUserParameters(parameter);
        if (userParameter.length) {
            const assignedUserId = this.getParameterValue(parameter, ContactProperty.ASSIGNED_USER_ID);
            userId = await this.createOrUpdateUser(token, clientRequestId, userParameter, assignedUserId).catch(
                (error: Error) => {
                    LoggingService.getInstance().error(
                        `${error.Code}: Could not create or update user for contact ${error.Message}`, error
                    );
                    throw new Error(error.Code, error.Message);
                }
            );
            if (!assignedUserId && userId) {
                parameter.push(
                    [ContactProperty.ASSIGNED_USER_ID, userId]
                );
            }
        }

        const contactParameter = parameter.filter(
            (p) => !userParameter.some((up) => up[0] === p[0]) || p[0] === KIXObjectProperty.VALID_ID
        );
        this.prepareOrganisationIdsParameter(contactParameter);
        const updateContact = new UpdateContact(contactParameter);

        const response = await this.sendUpdateRequest<UpdateContactResponse, UpdateContactRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), new UpdateContactRequest(updateContact),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon && icon.Content) {
            icon.Object = objectType;
            icon.ObjectID = response.ContactID;
            await this.updateIcon(token, clientRequestId, icon)
                .catch(() => {
                    // be silent
                });
        }

        return response.ContactID;
    }

    private getUserParameters(parameter: Array<[string, any]>): Array<[string, any]> {
        return parameter.filter((p) =>
            p[0] === UserProperty.USER_LOGIN ||
            p[0] === UserProperty.USER_PASSWORD ||
            p[0] === UserProperty.USER_COMMENT ||
            p[0] === UserProperty.USER_ACCESS ||
            p[0] === UserProperty.IS_AGENT ||
            p[0] === UserProperty.IS_CUSTOMER ||
            p[0] === UserProperty.ROLE_IDS ||
            p[0] === PersonalSettingsProperty.MY_QUEUES ||
            p[0] === PersonalSettingsProperty.NOTIFICATIONS ||
            p[0] === PersonalSettingsProperty.USER_LANGUAGE
        );
    }

    private prepareOrganisationIdsParameter(parameter: Array<[string, any]>): void {
        const orgIdParamIndex = parameter.findIndex((v) => v[0] === ContactProperty.PRIMARY_ORGANISATION_ID);
        const orgIdsParamIndex = parameter.findIndex((v) => v[0] === ContactProperty.ORGANISATION_IDS);

        if (orgIdParamIndex !== -1 && parameter[orgIdParamIndex][1]) {
            const orgId = parameter[orgIdParamIndex][1];
            if (orgIdsParamIndex !== -1) {
                if (Array.isArray(parameter[orgIdsParamIndex][1])) {
                    if (!parameter[orgIdsParamIndex][1].some((id) => id === orgId)) {
                        parameter[orgIdsParamIndex][1].push(orgId);
                    }
                } else {
                    parameter[orgIdsParamIndex][1] = [orgId];
                }
            } else {
                parameter.push([ContactProperty.ORGANISATION_IDS, [orgId]]);
            }
        }
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const filterCriteria = criteria.filter((f) =>
            !this.isUserProperty(f.property) &&
            f.property !== ContactProperty.EMAIL
        );

        return filterCriteria;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        let searchCriteria = criteria.filter((f) =>
            f.property !== ContactProperty.PRIMARY_ORGANISATION_ID &&
            f.property !== SearchProperty.PRIMARY &&
            (
                f.operator !== SearchOperator.IN ||
                f.property === ContactProperty.EMAIL ||
                f.property === KIXObjectProperty.VALID_ID
            )
        );

        const primary = criteria.find((f) => f.property === SearchProperty.PRIMARY);
        if (primary) {
            const primarySearch = [
                new FilterCriteria(
                    ContactProperty.EMAIL, SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, `${primary.value}`
                ),
            ];
            searchCriteria = [...searchCriteria, ...primarySearch];
        }

        const loginProperty = searchCriteria.find((sc) => sc.property === UserProperty.USER_LOGIN);
        if (loginProperty) {
            loginProperty.property = 'Login';
        }

        return searchCriteria;
    }

    private isUserProperty(property: string): boolean {
        const userProperties = Object.keys(UserProperty).map((p) => UserProperty[p]);
        return userProperties.some((p) => p === property);
    }
}
