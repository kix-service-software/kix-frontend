import { ISocketRequest } from "../../../socket";

export class MainMenuEntriesRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string
    ) { }

}
