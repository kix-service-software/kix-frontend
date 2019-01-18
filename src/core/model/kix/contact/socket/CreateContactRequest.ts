export class CreateContactRequest {

    public constructor(
        public token: string,
        public parameter: Array<[string, any]>
    ) { }

}
