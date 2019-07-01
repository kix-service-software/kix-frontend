import { ISocketRequest } from "../../ISocketRequest";

export class SetPreferencesRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public parameter: Array<[string, any]>
    ) { }

}
