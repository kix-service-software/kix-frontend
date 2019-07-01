import { ISocketResponse } from "../../ISocketResponse";

export class SetPreferencesResponse implements ISocketResponse {

    public constructor(
        public requestId: string
    ) { }

}
