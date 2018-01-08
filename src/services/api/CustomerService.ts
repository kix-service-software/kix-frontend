import { ICustomerService } from "@kix/core/dist/services/api/ICustomerService";
import { ObjectService } from './ObjectService';
import { Customer, CustomerSource } from "@kix/core/dist/model/";
import {
    CreateCustomer,
    CreateCustomerRequest,
    CreateCustomerResponse,
    CustomerResponse,
    CustomersResponse,
    CustomerSourcesResponse,
    UpdateCustomer,
    UpdateCustomerResponse,
    UpdateCustomerRequest
} from "@kix/core/dist/api/";
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class CustomerService extends ObjectService<Customer> implements ICustomerService {

    protected RESOURCE_URI: string = "customers";

    public async getCustomers(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<Customer[]> {

        const response = await this.getObjects<CustomersResponse>(
            token, limit, order, changedAfter, query
        );

        return response.Customer;
    }

    public async getCustomerSources(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<CustomerSource[]> {
        const response = await this.getObjects<CustomerSourcesResponse>(
            token, limit, order, changedAfter, query
        );

        return response.CustomerSource;
    }

    public async getCustomer(token: string, customerId: string, query?: any): Promise<Customer> {
        const response = await this.getObject<CustomerResponse>(
            token, customerId
        );

        return response.Customer;
    }

    public async createCustomer(token: string, sourceId: string, createCustomer: CreateCustomer): Promise<string> {
        const response = await this.createObject<CreateCustomerResponse, CreateCustomerRequest>(
            token, this.RESOURCE_URI, new CreateCustomerRequest(sourceId, createCustomer)
        );

        return response.CustomerID;
    }

    public async updateCustomer(token: string, customerId: string, updateCustomer: UpdateCustomer): Promise<string> {
        const uri = this.buildUri(this.RESOURCE_URI, customerId);
        const response = await this.updateObject<UpdateCustomerResponse, UpdateCustomerRequest>(
            token, uri, new UpdateCustomerRequest(updateCustomer)
        );

        return response.CustomerID;
    }

    public async deleteCustomer(token: string, customerId: string): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, customerId);
        await this.deleteObject<void>(token, uri);
    }

}
