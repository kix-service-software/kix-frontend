import { ICustomerService } from "@kix/core/dist/services/api/ICustomerService";
import { ObjectService } from './ObjectService';
import { Customer, CustomerSource, SortOrder } from "@kix/core/dist/model/";
import { CustomerResponse, CustomersResponse } from "@kix/core/dist/api/";

export class CustomerService extends ObjectService<Customer> implements ICustomerService {

    protected RESOURCE_URI: string = "customers";

    public async getCustomer(token: string, customerId: string): Promise<Customer> {
        const response = await this.getObject<CustomerResponse>(token, customerId);
        return response.Customer;
    }
}
