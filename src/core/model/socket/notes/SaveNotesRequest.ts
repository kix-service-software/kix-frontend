export class SaveNotesRequest {

    public constructor(
        public token: string,
        public contextId: string,
        public notes: string
    ) { }

}
