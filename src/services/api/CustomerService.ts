import { ICustomerService } from "@kix/core/dist/services/api/ICustomerService";
import { ObjectService } from './ObjectService';
import { Customer, CustomerSource, SortOrder } from "@kix/core/dist/model/";
import {
    CustomerResponse,
    CustomersResponse,
    CustomerSourcesResponse
} from "@kix/core/dist/api/";

export class CustomerService extends ObjectService<Customer> implements ICustomerService {

    private sourcesCache: Map<string, CustomerSource> = new Map();

    protected RESOURCE_URI: string = "customers";

    public async getCustomer(token: string, customerId: string): Promise<Customer> {
        const response = await this.getObject<CustomerResponse>(token, customerId);
        if (!this.sourcesCache.has(response.Customer.SourceID)) {
            await this.laodCustomerSources(token);
        }
        return new Customer(response.Customer, this.sourcesCache.get(response.Customer.SourceID));
    }

    private async laodCustomerSources(token: string): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, 'sources');
        const response = await this.getObjectByUri<CustomerSourcesResponse>(token, uri);
        response.CustomerSource.forEach((s) => {
            if (!this.sourcesCache.has(s.ID)) {
                this.sourcesCache.set(s.ID, s);
            }
        });
    }
}
