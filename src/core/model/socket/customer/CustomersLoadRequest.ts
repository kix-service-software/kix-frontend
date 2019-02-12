export class CustomersLoadRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public customerIds: string[],
        public searchValue?: string
    ) { }

}
