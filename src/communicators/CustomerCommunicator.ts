import {
    CustomersLoadRequest,
    CustomersLoadResponse,
    CustomerEvent,
    SocketEvent,
    CreateCustomerRequest,
    CreateCustomerResponse
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class CustomerCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'customers';
    }

    protected registerEvents(): void {
        this.registerEventHandler(CustomerEvent.LOAD_CUSTOMERS, this.loadCustomers.bind(this));
        this.registerEventHandler(CustomerEvent.CREATE_CUSTOMER, this.createCustomer.bind(this));
    }

    private async loadCustomers(data: CustomersLoadRequest): Promise<CommunicatorResponse<CustomersLoadResponse>> {
        const customers = await this.customerService.getCustomers(data.token, data.customerIds);
        const response = new CustomersLoadResponse(data.requestId, customers);
        return new CommunicatorResponse(CustomerEvent.CUSTOMERS_LOADED, response);
    }

    private async createCustomer(data: CreateCustomerRequest): Promise<CommunicatorResponse<CreateCustomerResponse>> {
        let response;
        await this.customerService.createCustomer(data.token, data.parameter)
            .then((customerId) => {
                const createTicketResponse = new CreateCustomerResponse(customerId);
                response = new CommunicatorResponse(CustomerEvent.CREATE_CUSTOMER_FINISHED, createTicketResponse);
            })
            .catch((error) => {
                response = new CommunicatorResponse(CustomerEvent.CREATE_CUSTOMER_ERROR, error.message);
            });

        return response;
    }

}
