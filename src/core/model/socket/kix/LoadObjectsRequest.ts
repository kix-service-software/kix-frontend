import { KIXObjectType } from "../../kix";
import { KIXObjectLoadingOptions } from "../../KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";
import { ISocketRequest } from "../ISocketRequest";

export class LoadObjectsRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public objectType: KIXObjectType,
        public objectIds: Array<string | number> = null,
        public loadingOptions: KIXObjectLoadingOptions = null,
        public objectLoadingOptions: KIXObjectSpecificLoadingOptions = null
    ) { }

}
