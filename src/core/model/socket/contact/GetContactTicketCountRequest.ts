export class GetContactTicketCountRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public contactId: string,
        public stateTypeIds: number[]
    ) { }

}
