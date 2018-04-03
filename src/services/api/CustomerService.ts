import { ICustomerService } from "@kix/core/dist/services/api/ICustomerService";
import { ObjectService } from './ObjectService';
import { Customer, CustomerSource, SortOrder } from "@kix/core/dist/model/";
import {
    CustomerResponse,
    CustomersResponse,
    CustomerSourceResponse,
    CustomerSourcesResponse
} from "@kix/core/dist/api/";

export class CustomerService extends ObjectService<Customer> implements ICustomerService {

    private sourcesCache: Map<string, CustomerSource> = new Map();

    protected RESOURCE_URI: string = "customers";

    public async getCustomer(token: string, customerId: string): Promise<Customer> {
        const response = await this.getObject<CustomerResponse>(token, customerId);
        if (!this.sourcesCache.has(response.Customer.SourceID)) {
            const source = await this.getCustomerSource(token, response.Customer.SourceID);
            this.sourcesCache.set(response.Customer.SourceID, source);
        }
        return new Customer(response.Customer, this.sourcesCache.get(response.Customer.SourceID));
    }

    public async getCustomerSources(token: string): Promise<CustomerSource[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'sources');
        const response = await this.getObjectByUri<CustomerSourcesResponse>(token, uri);
        return response.CustomerSources;
    }

    public async getCustomerSource(token: string, sourceId: string): Promise<CustomerSource> {
        const uri = this.buildUri(this.RESOURCE_URI, 'sources', sourceId);
        const response = await this.getObjectByUri<CustomerSourceResponse>(token, uri);
        return response.CustomerSource;
    }
}
