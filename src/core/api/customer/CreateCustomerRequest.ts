import { CreateCustomer } from './CreateCustomer';

export class CreateCustomerRequest {

    public constructor(
        public SourceID: string, public Customer: CreateCustomer
    ) { }

}
