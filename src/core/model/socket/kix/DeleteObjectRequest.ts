import { KIXObjectType } from "../../kix";
import { KIXObjectSpecificDeleteOptions } from "../../KIXObjectSpecificDeleteOptions";
import { ISocketRequest } from "../ISocketRequest";

export class DeleteObjectRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public objectType: KIXObjectType,
        public objectId: string | number,
        public deleteOptions: KIXObjectSpecificDeleteOptions
    ) { }

}
