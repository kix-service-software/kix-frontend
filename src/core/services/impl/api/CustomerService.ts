import { KIXObjectService } from './KIXObjectService';
import {
    Customer, CustomerFactory, CustomerSource, CustomerSourceAttributeMapping, CustomerProperty,
    KIXObjectType, KIXObjectLoadingOptions, Error
} from '../../../model';
import {
    CustomerResponse, CustomersResponse, CustomerSourcesResponse, CreateCustomer, CreateCustomerResponse,
    CreateCustomerRequest, UpdateCustomer, UpdateCustomerRequest, UpdateCustomerResponse
} from '../../../api';
import { SearchOperator } from '../../../browser';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';

export class CustomerService extends KIXObjectService {

    private static INSTANCE: CustomerService;

    public static getInstance(): CustomerService {
        if (!CustomerService.INSTANCE) {
            CustomerService.INSTANCE = new CustomerService();
        }
        return CustomerService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'customers';

    private sourcesCache: CustomerSource[] = [];

    public objectType: KIXObjectType = KIXObjectType.CUSTOMER;

    private customerCache: Customer[] = [];

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CUSTOMER;
    }

    public updateCache(customerId: string): void {
        const index = this.customerCache.findIndex((c) => c.CustomerID === customerId);
        if (index !== -1) {
            this.customerCache.splice(index, 1);
        }
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions
    ): Promise<T[]> {
        let customers = [];

        const query = this.prepareQuery(loadingOptions);

        if (!query.include) {
            query.include = "Contacts,Tickets,TicketStats";
        } else {
            query.include = query.include + ",Contacts,Tickets,TicketStats";
        }

        if (objectIds) {
            if (!!objectIds.length) {
                objectIds = objectIds.filter(
                    (id) => id && typeof id !== 'undefined' && id.toString() !== '' && id !== null
                );

                const uri = this.buildUri(this.RESOURCE_URI, objectIds.join(','));
                const response = await this.getObjectByUri<CustomersResponse | CustomerResponse>(token, uri, query);

                if (objectIds.length === 1) {
                    const res = response as CustomerResponse;
                    customers = [CustomerFactory.create(
                        res.Customer, this.sourcesCache.find((cs) => cs.ID === res.Customer.SourceID)
                    )];
                } else {
                    const res = response as CustomersResponse;
                    customers = [...res.Customer.map(
                        (c) => CustomerFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
                    )];
                }
            }
        } else if (loadingOptions.searchValue) {
            for (let i = 0; i < this.sourcesCache.length; i++) {
                const source = this.sourcesCache[i];

                this.buildSearchFilter(source, loadingOptions.searchValue, query);

                const response = await this.getObjects<CustomersResponse>(
                    token, loadingOptions.limit, null, null, query
                );

                customers = response.Customer.map(
                    (c) => CustomerFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
                );
            }
        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'Customer', token, query);
            const response = await this.getObjects<CustomersResponse>(token, loadingOptions.limit, null, null, query);
            customers = response.Customer.map(
                (c) => CustomerFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
            );
        } else {
            const response = await this.getObjects<CustomersResponse>(token, loadingOptions.limit, null, null, query);
            customers = response.Customer.map(
                (c) => CustomerFactory.create(c, this.sourcesCache.find((cs) => cs.ID === c.SourceID))
            );
        }

        return customers;
    }

    public async getCustomer(token: string, customerId: string): Promise<Customer> {
        const response = await this.getObject<CustomerResponse>(token, customerId);
        if (!this.sourcesCache.some((cs) => cs.ID === response.Customer.SourceID)) {
            await this.loadCustomerSources(token);
        }
        return CustomerFactory.create(
            response.Customer,
            this.sourcesCache.find((cs) => cs.ID === response.Customer.SourceID)
        );
    }

    public async getCustomers(token: string, customerIds: string[], searchValue?: string): Promise<Customer[]> {
        return [];
    }

    public async getAttributeMapping(token: string): Promise<CustomerSourceAttributeMapping[]> {
        await this.loadCustomerSources(token);

        let mappings = [];
        this.sourcesCache.forEach((source) => {
            mappings = [...mappings, ...source.AttributeMapping];
        });

        return mappings;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>
    ): Promise<string> {
        await this.loadCustomerSources(token);

        // FIXME: korrekte source verwenden
        const sourceID = this.sourcesCache[0].ID;

        const createCustomer = new CreateCustomer(parameter);

        const response = await this.sendCreateRequest<CreateCustomerResponse, CreateCustomerRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateCustomerRequest(sourceID, createCustomer),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.CustomerID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateCustomer = new UpdateCustomer(
            null,
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_NAME),
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_STREET),
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_ZIP),
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_CITY),
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_COUNTRY),
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_URL),
            this.getParameterValue(parameter, CustomerProperty.CUSTOMER_COMPANY_COMMENT),
            this.getParameterValue(parameter, CustomerProperty.VALID_ID)
        );

        const response = await this.sendUpdateRequest<UpdateCustomerResponse, UpdateCustomerRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId),
            new UpdateCustomerRequest(updateCustomer), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.CustomerID;
    }

    private async loadCustomerSources(token: string): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, 'sources');
        const response = await this.getObjectByUri<CustomerSourcesResponse>(token, uri);
        response.CustomerSource.forEach((s) => {
            if (!this.sourcesCache.find((cs) => cs.ID === s.ID)) {
                this.sourcesCache.push(s);
            }
        });
    }

    private buildSearchFilter(source: CustomerSource, searchValue: string, query: any): void {
        const searchableAttributes = source.AttributeMapping.filter((a) => a.Searchable);

        const searchAttributes = searchableAttributes.map((sa) => {
            return {
                Field: sa.Attribute,
                Operator: SearchOperator.CONTAINS,
                Value: searchValue
            };
        });

        const filter = { Customer: { OR: searchAttributes } };
        query.filter = JSON.stringify(filter);
        query.search = JSON.stringify(filter);
    }

}
