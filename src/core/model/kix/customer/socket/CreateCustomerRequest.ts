export class CreateCustomerRequest {

    public constructor(
        public token: string,
        public parameter: Array<[string, any]>
    ) { }

}
