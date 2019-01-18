export class LoadNotesRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public contextId: string
    ) { }

}
