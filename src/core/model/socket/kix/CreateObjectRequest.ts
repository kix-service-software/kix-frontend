import { KIXObjectType } from "../../kix";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { ISocketRequest } from "../ISocketRequest";

export class CreateObjectRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public objectType: KIXObjectType,
        public parameter: Array<[string, any]>,
        public createOptions?: KIXObjectSpecificCreateOptions
    ) { }

}
