import { KIXObjectService } from './KIXObjectService';
import {
    Contact, ContactFactory, ContactSource, ContactSourceAttributeMapping,
    ContactProperty, KIXObjectType, KIXObjectLoadingOptions, KIXObjectCache, ContactCacheHandler, Error
} from "../../../model";
import {
    ContactResponse, ContactsResponse, ContactSourcesResponse,
    CreateContact, CreateContactResponse, CreateContactRequest, UpdateContactResponse,
    UpdateContactRequest, UpdateContact
} from "../../../api";
import { SearchOperator } from '../../../browser/SearchOperator';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
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

    public kixObjectType: KIXObjectType = KIXObjectType.CONTACT;

    private constructor() {
        super();
        KIXObjectServiceRegistry.getInstance().registerServiceInstance(this);
        KIXObjectCache.registerCacheHandler(new ContactCacheHandler());
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONTACT;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        await this.loadContactSources(token);

        const response = await this.getObjects<ContactsResponse>(token, null, null, null, {
            include: "TicketStats"
        });

        response.Contact
            .map((c) => ContactFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID)))
            .forEach((c) => KIXObjectCache.addObject(KIXObjectType.CONTACT, c));
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: string[], loadingOptions: KIXObjectLoadingOptions
    ): Promise<T[]> {
        let contacts = [];

        if (!this.sourcesCache || !this.sourcesCache.length) {
            await this.loadContactSources(token);
        }
        const query = this.prepareQuery(loadingOptions);

        if (objectIds) {
            objectIds = objectIds.filter(
                (id) => id && typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const idsToLoad = KIXObjectCache.getIdsToLoad(KIXObjectType.CONTACT, objectIds);

            if (idsToLoad.length) {
                const uri = this.buildUri(this.RESOURCE_URI, idsToLoad.join(','));
                const response = await this.getObjectByUri<ContactsResponse | ContactResponse>(token, uri, query);

                if (idsToLoad.length === 1) {
                    const res = response as ContactResponse;
                    KIXObjectCache.addObject(
                        KIXObjectType.CONTACT,
                        ContactFactory.create(
                            res.Contact, this.sourcesCache.find((cs) => cs.ID === res.Contact.SourceID)
                        )
                    );
                } else {
                    const res = response as ContactsResponse;
                    res.Contact.map(
                        (c) => ContactFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
                    ).forEach((c) => KIXObjectCache.addObject(KIXObjectType.CONTACT, c));
                }
            }

            contacts = KIXObjectCache.getCachedObjects(KIXObjectType.CONTACT, objectIds);
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
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {
        await this.loadContactSources(token);

        // FIXME: korrekte source verwenden
        const sourceID = this.sourcesCache[0].ID;

        const createContact = new CreateContact(parameter);
        const response = await this.sendCreateRequest<CreateContactResponse, CreateContactRequest>(
            token, this.RESOURCE_URI, new CreateContactRequest(sourceID, createContact)
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const customerIdValue = parameter.find((v) => v[0] === ContactProperty.USER_CUSTOMER_ID);
        if (customerIdValue) {
            const customerService = KIXObjectServiceRegistry.getInstance().getServiceInstance(KIXObjectType.CUSTOMER);
            customerService.updateCache(customerIdValue[1]);
        }

        return response.ContactID;
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const customerUserId = this.getParameterValue(parameter, ContactProperty.USER_CUSTOMER_ID);
        let customerUserIds = this.getParameterValue(parameter, ContactProperty.USER_CUSTOMER_IDS);

        if (customerUserId) {
            if (customerUserIds && !customerUserIds.some((id) => customerUserId)) {
                customerUserIds.push(customerUserId);
            } else {
                customerUserIds = [customerUserId];
            }
        }

        const updateContact = new UpdateContact(
            null,
            this.getParameterValue(parameter, ContactProperty.USER_EMAIL),
            this.getParameterValue(parameter, ContactProperty.USER_FIRST_NAME),
            this.getParameterValue(parameter, ContactProperty.USER_LAST_NAME),
            customerUserId,
            customerUserIds,
            this.getParameterValue(parameter, ContactProperty.USER_PHONE),
            this.getParameterValue(parameter, ContactProperty.USER_COUNTRY),
            this.getParameterValue(parameter, ContactProperty.USER_TITLE),
            this.getParameterValue(parameter, ContactProperty.USER_FAX),
            this.getParameterValue(parameter, ContactProperty.USER_MOBILE),
            this.getParameterValue(parameter, ContactProperty.USER_COMMENT),
            this.getParameterValue(parameter, ContactProperty.USER_STREET),
            this.getParameterValue(parameter, ContactProperty.USER_CITY),
            this.getParameterValue(parameter, ContactProperty.USER_ZIP),
            this.getParameterValue(parameter, ContactProperty.VALID_ID)
        );

        const response = await this.sendUpdateRequest<UpdateContactResponse, UpdateContactRequest>(
            token, this.buildUri(this.RESOURCE_URI, objectId), new UpdateContactRequest(updateContact)
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.ContactID;
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
