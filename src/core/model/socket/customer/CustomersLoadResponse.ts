import { Customer } from "../..";

export class CustomersLoadResponse {

    public constructor(
        public requestId: string,
        public customers: Customer[]
    ) { }

}
