import { KIXObject } from "../../kix";
import { ISocketResponse } from "../ISocketResponse";

export class LoadObjectsResponse<T extends KIXObject> implements ISocketResponse {

    public constructor(
        public requestId: string,
        public objects: T[]
    ) { }

}
