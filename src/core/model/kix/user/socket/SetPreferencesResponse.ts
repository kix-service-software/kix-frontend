import { ISocketResponse } from "../../../socket";

export class SetPreferencesResponse implements ISocketResponse {

    public constructor(
        public requestId: string
    ) { }

}
