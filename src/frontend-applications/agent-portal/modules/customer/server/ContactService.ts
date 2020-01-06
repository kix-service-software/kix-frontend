/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from "../../../server/services/KIXObjectAPIService";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { ContactFactory } from "./ContactFactory";
import { KIXObjectServiceRegistry } from "../../../server/services/KIXObjectServiceRegistry";
import { KIXObjectLoadingOptions } from "../../../model/KIXObjectLoadingOptions";
import { LoggingService } from "../../../../../server/services/LoggingService";
import { ContactProperty } from "../model/ContactProperty";
import { FilterCriteria } from "../../../model/FilterCriteria";
import { FilterType } from "../../../model/FilterType";
import { CreateContact } from "./api/CreateContact";
import { CreateContactResponse } from "./api/CreateContactResponse";
import { CreateContactRequest } from "./api/CreateContactRequest";
import { UpdateContact } from "./api/UpdateContact";
import { UpdateContactResponse } from "./api/UpdateContactResponse";
import { UpdateContactRequest } from "./api/UpdateContactRequest";
import { Error } from "../../../../../server/model/Error";

export class ContactAPIService extends KIXObjectAPIService {

    private static INSTANCE: ContactAPIService;

    protected enableSearchQuery: boolean = false;

    public static getInstance(): ContactAPIService {
        if (!ContactAPIService.INSTANCE) {
            ContactAPIService.INSTANCE = new ContactAPIService();
        }
        return ContactAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = "contacts";

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    private constructor() {
        super([new ContactFactory()]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions
    ): Promise<T[]> {
        const objects = await super.load(
            token, KIXObjectType.CONTACT, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.CONTACT
        );

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {
        this.prepareOrganisationIdsParameter(parameter);

        const createContact = new CreateContact(parameter);
        const response = await this.sendCreateRequest<CreateContactResponse, CreateContactRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateContactRequest(createContact),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ContactID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {

        this.prepareOrganisationIdsParameter(parameter);

        const updateContact = new UpdateContact(parameter);

        const response = await this.sendUpdateRequest<UpdateContactResponse, UpdateContactRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), new UpdateContactRequest(updateContact),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ContactID;
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

    // Overwrites from KIXObjectService
    // FIXME: unterschiedliche Behandlung von Filter und Search entfernen, sollte nicht notwendig sein
    protected async buildFilter(filter: FilterCriteria[], filterProperty: string, query: any): Promise<void> {
        let objectFilter = {};
        let objectSearch = {};

        const andFilter = filter.filter(
            (f) => f.filterType === FilterType.AND
                && f.property !== ContactProperty.FULLTEXT
        ).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });
        const andSearch = filter.filter(
            (f) => f.filterType === FilterType.AND && f.property !== ContactProperty.ORGANISATION_IDS
        ).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (andFilter && andFilter.length) {
            objectFilter = {
                AND: andFilter
            };
        }
        if (andSearch && andSearch.length) {
            objectSearch = {
                AND: andSearch
            };
        }

        const orFilter = filter.filter(
            (f) => f.filterType === FilterType.OR
                && f.property !== ContactProperty.FULLTEXT
        ).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });
        const orSearch = filter.filter(
            (f) => f.filterType === FilterType.OR
        ).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (orFilter && orFilter.length) {
            objectFilter = {
                ...objectFilter,
                OR: orFilter
            };
        }
        if (orSearch && orSearch.length) {
            objectSearch = {
                ...objectSearch,
                OR: orSearch
            };
        }

        if ((andFilter && !!andFilter.length) || (orFilter && !!orFilter.length)) {
            const apiFilter = {};
            apiFilter[filterProperty] = objectFilter;
            query.filter = JSON.stringify(apiFilter);
        }

        if ((andSearch && !!andSearch.length) || (orSearch && !!orSearch.length)) {
            const search = {};
            search[filterProperty] = objectSearch;
            query.search = JSON.stringify(search);
        }
    }

}
