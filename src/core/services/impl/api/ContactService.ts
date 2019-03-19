import { KIXObjectService } from './KIXObjectService';
import {
    Contact, ContactFactory, ContactSource, ContactSourceAttributeMapping,
    ContactProperty, KIXObjectType, KIXObjectLoadingOptions, Error
} from "../../../model";
import {
    ContactResponse, ContactsResponse, ContactSourcesResponse,
    CreateContact, CreateContactResponse, CreateContactRequest, UpdateContactResponse,
    UpdateContactRequest, UpdateContact
} from "../../../api";
import { SearchOperator } from '../../../browser/SearchOperator';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';

export class ContactService extends KIXObjectService {

    private static INSTANCE: ContactService;

    public static getInstance(): ContactService {
        if (!ContactService.INSTANCE) {
            ContactService.INSTANCE = new ContactService();
        }
        return ContactService.INSTANCE;
    }

    protected RESOURCE_URI: string = "contacts";

    private sourcesCache: ContactSource[] = [];

    public objectType: KIXObjectType = KIXObjectType.CONTACT;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions
    ): Promise<T[]> {
        let contacts = [];

        if (!this.sourcesCache || !this.sourcesCache.length) {
            await this.loadContactSources(token);
        }
        const query = this.prepareQuery(loadingOptions);

        if (objectIds && objectIds.length) {
            objectIds = objectIds.filter(
                (id) => id && typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri(this.RESOURCE_URI, objectIds.join(','));
            const response = await this.getObjectByUri<ContactsResponse | ContactResponse>(token, uri, query);

            if (objectIds.length === 1) {
                const res = response as ContactResponse;
                contacts = [ContactFactory.create(
                    res.Contact, this.sourcesCache.find((cs) => cs.ID === res.Contact.SourceID)
                )];
            } else {
                const res = response as ContactsResponse;
                contacts = [...res.Contact.map(
                    (c) => ContactFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
                )];
            }
        } else if (loadingOptions.searchValue) {
            for (let i = 0; i < this.sourcesCache.length; i++) {
                const source = this.sourcesCache[i];

                this.buildSearchFilter(source, loadingOptions.searchValue, query);

                const response = await this.getObjects<ContactsResponse>(
                    token, loadingOptions.limit, null, null, query
                );

                contacts = response.Contact.map(
                    (c) => ContactFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
                );
            }
        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'Contact', token, query);
            const response = await this.getObjects<ContactsResponse>(token, loadingOptions.limit, null, null, query);
            contacts = response.Contact.map(
                (c) => ContactFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
            );
        } else {
            const response = await this.getObjects<ContactsResponse>(token, loadingOptions.limit, null, null, query);
            contacts = response.Contact.map(
                (c) => ContactFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
            );
        }

        return contacts;
    }

    public async getContact(token: string, contactId: string): Promise<Contact> {
        const response = await this.getObject<ContactResponse>(token, contactId);
        if (!this.sourcesCache.some((cs) => cs.ID === response.Contact.SourceID)) {
            await this.loadContactSources(token);
        }

        return ContactFactory.create(
            response.Contact, this.sourcesCache.find((cs) => cs.ID === response.Contact.SourceID)
        );
    }

    private async loadContactSources(token: string): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, 'sources');
        const response = await this.getObjectByUri<ContactSourcesResponse>(token, uri);

        response.ContactSource.forEach((s) => {
            if (!this.sourcesCache.find((cs) => cs.ID === s.ID)) {
                this.sourcesCache.push(s);
            }
        });
    }

    public async getAttributeMapping(token: string): Promise<ContactSourceAttributeMapping[]> {
        await this.loadContactSources(token);

        let mappings = [];
        this.sourcesCache.forEach((source) => {
            mappings = [...mappings, ...source.AttributeMapping];
        });

        return mappings;
    }


    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {
        await this.loadContactSources(token);

        // FIXME: korrekte source verwenden
        const sourceID = this.sourcesCache[0].ID;

        this.prepareCustomerIdsParameter(parameter);

        const createContact = new CreateContact(parameter);
        const response = await this.sendCreateRequest<CreateContactResponse, CreateContactRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateContactRequest(sourceID, createContact),
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

        this.prepareCustomerIdsParameter(parameter);

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

    private prepareCustomerIdsParameter(parameter: Array<[string, any]>): void {
        const customerIdParamIndex = parameter.findIndex((v) => v[0] === ContactProperty.USER_CUSTOMER_ID);
        const customerIdsParamIndex = parameter.findIndex((v) => v[0] === ContactProperty.USER_CUSTOMER_IDS);

        if (customerIdParamIndex !== -1 && parameter[customerIdParamIndex][1]) {
            const customerId = parameter[customerIdParamIndex][1];
            if (customerIdsParamIndex !== -1) {
                if (Array.isArray(parameter[customerIdsParamIndex][1])) {
                    if (!parameter[customerIdsParamIndex][1].some((id) => id === customerId)) {
                        parameter[customerIdsParamIndex][1].push(customerId);
                    }
                } else {
                    parameter[customerIdsParamIndex][1] = [customerId];
                }
            } else {
                parameter.push([ContactProperty.USER_CUSTOMER_IDS, [customerId]]);
            }
        }
    }

    private buildSearchFilter(source: ContactSource, searchValue: string, query: any): void {
        const searchableAttributes = source.AttributeMapping.filter((a) => a.Searchable);

        const searchAttributes = searchableAttributes.map((sa) => {
            return {
                Field: sa.Attribute,
                Operator: SearchOperator.CONTAINS,
                Value: searchValue
            };
        });

        const filter = { Contact: { OR: searchAttributes } };
        query.filter = JSON.stringify(filter);
        query.search = JSON.stringify(filter);
    }


}
