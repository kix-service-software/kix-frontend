import { ISocketRequest } from "../ISocketRequest";
import { KIXObjectType } from "../../kix";

export class LoadKIXModulesRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string
    ) { }

}
