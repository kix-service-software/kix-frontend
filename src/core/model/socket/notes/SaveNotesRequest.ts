import { ISocketRequest } from "../ISocketRequest";

export class SaveNotesRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public contextId: string,
        public notes: string
    ) { }

}
