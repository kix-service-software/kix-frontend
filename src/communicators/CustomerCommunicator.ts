import {
    CustomersLoadRequest,
    CustomersLoadResponse,
    CustomerEvent,
    SocketEvent
} from '@kix/core/dist/model';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class CustomerCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'customers';
    }

    protected registerEvents(): void {
        this.registerEventHandler(CustomerEvent.LOAD_CUSTOMERS, this.loadCustomers.bind(this));
    }

    private async loadCustomers(data: CustomersLoadRequest): Promise<CommunicatorResponse<CustomersLoadResponse>> {
        const Customers = await this.customerService.getCustomers(data.token, data.customerIds);
        const response = new CustomersLoadResponse(data.requestId, Customers);
        return new CommunicatorResponse(CustomerEvent.CUSTOMERS_LOADED, response);
    }

}
