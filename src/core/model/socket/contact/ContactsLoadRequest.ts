export class ContactsLoadRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public contactIds: string[],
        public searchValue?: string,
        public customerId?: string,
        public limit: number = 0,
    ) { }

}
